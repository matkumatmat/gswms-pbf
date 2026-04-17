// src/domain/product/StockAggregatorService.js

class StockAggregatorService {
  constructor() {
    this.hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
    this.ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  }

  /**
   * Main execution flow untuk Cron Job
   */
  executeDailySync() {
    Logger.log("Starting daily stock aggregation sync.");

    const stockMap = new Map();

    // 1. Tarik saldo dasar dari Cold Storage
    this._loadColdStorage(stockMap);

    // 2. Tarik dan hitung mutasi berjalan dari Hot Storage
    this._processHotStorage(stockMap);

    // 3. Tulis hasil akhir ke sheet Rekap
    this._dumpToRekap(stockMap);

    // 4. Update status flag (ANOMALI, EXPIRED, CLOSED, ACTIVE) di tabel PM_BATCH
    this._updateBatchStatuses(stockMap);

    Logger.log("Daily sync completed successfully.");
  }

  _loadColdStorage(stockMap) {
    const sheetCold = this.ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    if (!sheetCold) {
      Logger.log("Warning: Sheet Cold Rekap tidak ditemukan. Mengabaikan data historis.");
      return;
    }

    const lastRow = sheetCold.getLastRow();
    if (lastRow < 2) return;

    const data = sheetCold.getRange(2, 1, lastRow - 1, 5).getValues(); // Ambil sampai kolom Saldo Akhir

    for (let i = 0; i < data.length; i++) {
      const batch = String(data[i][0]).trim();
      const kodeBarang = String(data[i][1]).trim();
      const totalIn = parseFloat(data[i][2]) || 0;
      const totalOut = parseFloat(data[i][3]) || 0;

      if (batch) {
        stockMap.set(batch, { kodeBarang: kodeBarang, in: totalIn, out: totalOut });
      }
    }
  }

  _processHotStorage(stockMap) {
    const ssHot = SpreadsheetApp.openById(this.hotConfig.DB_DISTRIBUSI_CURRENT_ID);
    const sheetHot = ssHot.getSheetByName(this.hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);
    
    if (!sheetHot) {
      throw new Error("Sheet Hot Storage tidak ditemukan.");
    }

    const lastRow = sheetHot.getLastRow();
    if (lastRow < this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW) return;

    const mapConfig = this.hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
    const rawData = sheetHot.getRange(
      this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW, 
      1, 
      lastRow - this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW + 1, 
      sheetHot.getLastColumn()
    ).getValues();

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const batch = String(row[mapConfig.batch - 1] || '').trim();

      if (!batch || batch.toUpperCase() === 'BATCH') continue;

      const keterangan = String(row[mapConfig.keterangan - 1] || '').toUpperCase();
      const konsumen = String(row[mapConfig.namaKonsumen - 1] || '').toUpperCase();

      if (keterangan.includes('REVISI') || konsumen.includes('SALDO AWAL')) continue;

      const kodeBarang = String(row[mapConfig.kodeBarang - 1] || '-').trim();
      const qtyIn = parseFloat(row[mapConfig.penerimaan - 1]) || 0;
      const qtyOut = parseFloat(row[mapConfig.distribusi - 1]) || 0;

      if (!stockMap.has(batch)) {
        stockMap.set(batch, { kodeBarang: kodeBarang, in: 0, out: 0 });
      }

      const current = stockMap.get(batch);
      current.in += qtyIn;
      current.out += qtyOut;
    }
  }

  _dumpToRekap(stockMap) {
    let sheetRekap = this.ssMaster.getSheetByName(AppConfig.DB_STOK_REKAP_SHEET_NAME);
    if (!sheetRekap) {
      throw new Error("Sheet PM_STOK_REKAP tidak ditemukan. Harap buat terlebih dahulu.");
    }

    const timestamp = new Date();
    const outputData = [];

    stockMap.forEach((data, batchKey) => {
      const balance = data.in - data.out;
      outputData.push([batchKey, data.kodeBarang, data.in, data.out, balance, timestamp]);
    });

    if (outputData.length === 0) return;

    const lastRow = sheetRekap.getLastRow();
    if (lastRow > 1) {
      sheetRekap.getRange(2, 1, lastRow - 1, 6).clearContent();
    }

    sheetRekap.getRange("A:B").setNumberFormat("@"); // Force Plain Text
    sheetRekap.getRange(2, 1, outputData.length, 6).setValues(outputData);
  }

  _updateBatchStatuses(stockMap) {
    const sheetBatch = this.ssMaster.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
    if (!sheetBatch) return;

    const startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
    const lastRow = sheetBatch.getLastRow();
    if (lastRow < startRow) return;

    const batchData = sheetBatch.getRange(startRow, 1, lastRow - startRow + 1, sheetBatch.getLastColumn()).getValues();
    
    const batchIdx = AppConfig.DB_BATCH_LOOKUP_BATCH_COL - 1;
    const expIdx = AppConfig.DB_BATCH_LOOKUP_EXPIRY_DATE_COL - 1;
    const statusIdx = AppConfig.DB_BATCH_LOOKUP_SYS_STATUS_COL - 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updateCount = 0;

    for (let i = 0; i < batchData.length; i++) {
      const row = batchData[i];
      const batchNo = String(row[batchIdx] || '').trim();
      if (!batchNo) continue;

      const expDate = new Date(row[expIdx]);
      const currentStatus = String(row[statusIdx] || '').toUpperCase();
      let newStatus = currentStatus;

      const stockData = stockMap.get(batchNo);
      const currentStock = stockData ? (stockData.in - stockData.out) : 0;
      const isExpired = expDate < today;

      // Logic prioritas flag
      if (currentStock < 0) {
        newStatus = 'ANOMALI';
      } else if (isExpired) {
        newStatus = 'EXPIRED';
      } else if (currentStock === 0) {
        newStatus = 'CLOSED';
      } else {
        newStatus = 'ACTIVE';
      }

      if (newStatus !== currentStatus) {
        batchData[i][statusIdx] = newStatus;
        updateCount++;
      }
    }

    if (updateCount > 0) {
      sheetBatch.getRange(startRow, 1, batchData.length, batchData[0].length).setValues(batchData);
      Logger.log("Updated sysStatus for " + updateCount + " batches.");
    }
  }
}