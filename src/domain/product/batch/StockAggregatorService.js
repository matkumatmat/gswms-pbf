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
    console.log("Starting daily stock aggregation sync...");

    const stockMap = new Map();

    // 1. Tarik saldo dasar dari Cold Storage
    this._loadColdStorage(stockMap);

    // 2. Tarik dan hitung mutasi berjalan dari Hot Storage
    this._processHotStorage(stockMap);

    // 3. Tulis hasil akhir ke sheet Rekap
    this._dumpToRekap(stockMap);

    // 4. Update status flag (ANOMALI, EXPIRED, CLOSED, ACTIVE) di tabel PM_BATCH
    this._updateBatchStatuses(stockMap);

    console.log("Daily sync completed successfully.");
  }

  // Helper aman buat parse angka dari sheet (ngakalin titik/koma)
  _parseIdn(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  _loadColdStorage(stockMap) {
    const sheetCold = this.ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    if (!sheetCold) {
      console.warn("Sheet Cold Rekap tidak ditemukan. Mengabaikan data historis.");
      return;
    }

    const lastRow = sheetCold.getLastRow();
    if (lastRow < 2) return;

    const data = sheetCold.getRange(2, 1, lastRow - 1, 5).getValues(); 

    for (let i = 0; i < data.length; i++) {
      const batch = String(data[i][0]).trim().toUpperCase();
      const kodeBarang = String(data[i][1]).trim();
      const totalIn = this._parseIdn(data[i][2]);
      const totalOut = this._parseIdn(data[i][3]);

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
      const batch = String(row[mapConfig.batch - 1] || '').trim().toUpperCase();

      if (!batch || batch === 'BATCH') continue;

      const keterangan = String(row[mapConfig.keterangan - 1] || '').toUpperCase();
      const konsumen = String(row[mapConfig.namaKonsumen - 1] || '').toUpperCase();

      if (keterangan.includes('REVISI') || konsumen.includes('SALDO AWAL')) continue;

      const kodeBarang = String(row[mapConfig.kodeBarang - 1] || '-').trim();
      const qtyIn = this._parseIdn(row[mapConfig.penerimaan - 1]);
      const qtyOut = this._parseIdn(row[mapConfig.distribusi - 1]);

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
    
    // Auto-create kalau sheetnya ga sengaja kehapus
    if (!sheetRekap) {
      sheetRekap = this.ssMaster.insertSheet(AppConfig.DB_STOK_REKAP_SHEET_NAME);
      sheetRekap.appendRow(["BATCH", "KODE BARANG", "TOTAL IN", "TOTAL OUT", "SALDO AKHIR", "LAST SYNCED"]);
      sheetRekap.getRange("A1:F1").setFontWeight("bold").setBackground("#f1f5f9");
      sheetRekap.setFrozenRows(1);
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

    sheetRekap.getRange("A:B").setNumberFormat("@"); // Force Plain Text biar kode barang ga jadi angka aneh
    sheetRekap.getRange(2, 1, outputData.length, 6).setValues(outputData);
  }

  _updateBatchStatuses(stockMap) {
    const sheetBatch = this.ssMaster.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
    if (!sheetBatch) return;

    const startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
    const lastRow = sheetBatch.getLastRow();
    if (lastRow < startRow) return;

    // Baca data (Read-Only)
    const batchData = sheetBatch.getRange(startRow, 1, lastRow - startRow + 1, sheetBatch.getLastColumn()).getValues();
    
    const batchIdx = AppConfig.DB_BATCH_LOOKUP_BATCH_COL - 1;
    const expIdx = AppConfig.DB_BATCH_LOOKUP_EXPIRY_DATE_COL - 1;
    const statusIdx = AppConfig.DB_BATCH_LOOKUP_SYS_STATUS_COL - 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updateCount = 0;
    
    // Siapin array 1 Dimensi vertikal KHUSUS buat numpuk di 1 kolom status doang
    const newStatusesArray = []; 

    for (let i = 0; i < batchData.length; i++) {
      const row = batchData[i];
      const batchNo = String(row[batchIdx] || '').trim().toUpperCase();
      const currentStatus = String(row[statusIdx] || '').toUpperCase();
      
      if (!batchNo) {
        newStatusesArray.push([currentStatus]); // Tetep sama
        continue;
      }

      const expDate = new Date(row[expIdx]);
      let newStatus = currentStatus;

      const stockData = stockMap.get(batchNo);
      const currentStock = stockData ? (stockData.in - stockData.out) : 0;
      const isExpired = !isNaN(expDate.getTime()) && expDate < today;

      // Logic prioritas flag: Anomali (Minus) -> Expired -> Kosong -> Aktif
      if (currentStock < 0) {
        newStatus = 'ANOMALI';
      } else if (isExpired) {
        newStatus = 'EXPIRED';
      } else if (currentStock === 0) {
        newStatus = 'CLOSED';
      } else {
        newStatus = 'ACTIVE';
      }

      if (newStatus !== currentStatus) updateCount++;
      newStatusesArray.push([newStatus]);
    }

    // Tulis HANYA ke kolom sysStatus, jangan nimpah kolom lain!
    if (updateCount > 0) {
      sheetBatch.getRange(startRow, statusIdx + 1, newStatusesArray.length, 1).setValues(newStatusesArray);
      console.log(`Updated sysStatus for ${updateCount} batches.`);
      
      // Bersihin cache biar list active batch di frontend langsung update
      AppUtils.invalidateCache(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
    }
  }
}