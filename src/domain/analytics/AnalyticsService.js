// src/domain/analytics/AnalyticsService.js

class AnalyticsService {
  constructor() {
    this.hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
    this.productRepo = new ProductRepo();
    this.batchRepo = new BatchRepo();
  }

  _parseIdn(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  // ====================================================================
  // READ: Gabungin Chunk dari A1, A2, A3... (Supersonic ⚡)
  // ====================================================================
  getDashboardAnalytics() {
    try {
      const ss = SpreadsheetApp.openById(AppConfig.DB_OLAP_DATA_ID);
      const sheet = ss.getSheetByName(AppConfig.DB_OLAP_DATA_SHEET_NAME);
      
      if (!sheet) throw new Error("Sheet OLAP_AGG tidak ditemukan.");
      
      const lastRow = sheet.getLastRow();
      if (lastRow === 0) return { lastSync: null, masterProducts: [], batchMart: [] };
      
      // Ambil SEMUA baris di Kolom A yang ada isinya
      const chunks = sheet.getRange(1, 1, lastRow, 1).getValues();
      
      // Lem/Gabungin balik potongan-potongan stringnya
      let jsonString = "";
      for (let i = 0; i < chunks.length; i++) {
        jsonString += chunks[i][0];
      }
      
      if (!jsonString) return { lastSync: null, masterProducts: [], batchMart: [] };
      
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Gagal fetch OLAP Data:", e);
      return { lastSync: null, error: true };
    }
  }

  // ====================================================================
  // WRITE: Ngitung, Mutilasi (Chunking), & Simpan JSON (The Worker 👷)
  // ====================================================================
  buildAndSaveDashboardSummary() {
    console.log("Memulai kompilasi Data Mart...");
    
    const rawProducts = this.productRepo.getAllProductRaw();
    const productsMapped = AppUtils.mapArrayToObject(rawProducts, ProductRepo.TABLE_KEYS);
    const masterProducts = productsMapped.map(p => ({
      pId: p.id,
      kode: (p.kodeBarangNew && p.kodeBarangNew !== '-') ? p.kodeBarangNew : p.kodeBarang,
      nama: p.namaDagang,
      sektor: p.sektor || 'LAINNYA'
    }));

    const rawBatches = this.batchRepo.getAllBatchLookupRaw();
    const batches = AppUtils.mapArrayToObject(rawBatches, BatchRepo.TABLE_KEYS);
    const batchMartMap = new Map();
    
    batches.forEach(b => {
      if (!b.batch) return;
      batchMartMap.set(String(b.batch).toUpperCase().trim(), {
        b: String(b.batch).toUpperCase().trim(),
        pId: b.productId,
        sys: b.sysStatus || 'UNKNOWN',
        ed: b.expiryDate || null,
        rslBln: b.rslBulan || 0,
        in: 0, out: 0, stok: 0,
        lastTrxDate: null, 
        trxByMonth: {} 
      });
    });

    const ssHot = SpreadsheetApp.openById(this.hotConfig.DB_DISTRIBUSI_CURRENT_ID);
    const sheetHot = ssHot.getSheetByName(this.hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);
    const rawHot = sheetHot.getRange(this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW, 1, sheetHot.getLastRow(), sheetHot.getLastColumn()).getValues();
    const map = this.hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;

    for (let row of rawHot) {
      const bNo = String(row[map.batch - 1] || '').trim().toUpperCase();
      if (!batchMartMap.has(bNo)) continue;

      const bm = batchMartMap.get(bNo);
      const qIn = this._parseIdn(row[map.penerimaan - 1]);
      const qOut = this._parseIdn(row[map.distribusi - 1]);
      const tglRaw = row[map.tanggal - 1];

      bm.in += qIn; bm.out += qOut; bm.stok = bm.in - bm.out;

      if (tglRaw instanceof Date && !isNaN(tglRaw.getTime())) {
        const mKey = `${tglRaw.getFullYear()}-${String(tglRaw.getMonth() + 1).padStart(2, '0')}`;
        if (!bm.trxByMonth[mKey]) bm.trxByMonth[mKey] = { in: 0, out: 0 };
        bm.trxByMonth[mKey].in += qIn;
        bm.trxByMonth[mKey].out += qOut;

        if (qOut > 0) {
          if (!bm.lastTrxDate || tglRaw > new Date(bm.lastTrxDate)) {
            bm.lastTrxDate = tglRaw.toISOString();
          }
        }
      }
    }

    const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const sheetCold = ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    if (sheetCold && sheetCold.getLastRow() > 1) {
      const rawCold = sheetCold.getRange(2, 1, sheetCold.getLastRow() - 1, 4).getValues();
      for(let row of rawCold) {
        const bNo = String(row[0] || '').trim().toUpperCase();
        if (batchMartMap.has(bNo)) {
          const bm = batchMartMap.get(bNo);
          bm.in += this._parseIdn(row[2]);
          bm.out += this._parseIdn(row[3]);
          bm.stok = bm.in - bm.out;
        }
      }
    }

    const payload = {
      lastSync: new Date().toISOString(),
      masterProducts: masterProducts,
      batchMart: Array.from(batchMartMap.values())
    };

    // --- TEKNIK MUTILASI (CHUNKING) ANTI LIMIT 50k ---
    const jsonString = JSON.stringify(payload);
    const chunkSize = 45000; // Aman di bawah 50.000
    const chunkArray = [];

    // Potong-potong jsonString jadi array of arrays (karena setValues butuh 2D array)
    for (let i = 0; i < jsonString.length; i += chunkSize) {
      chunkArray.push([jsonString.substring(i, i + chunkSize)]);
    }

    const ssOlap = SpreadsheetApp.openById(AppConfig.DB_OLAP_DATA_ID);
    const sheetOlap = ssOlap.getSheetByName(AppConfig.DB_OLAP_DATA_SHEET_NAME);
    
    // Bersihin data lama sampe ke akar-akarnya
    sheetOlap.clearContents();
    
    // Tulis ulang hasil mutilasi secara vertikal (A1, A2, A3...)
    sheetOlap.getRange(1, 1, chunkArray.length, 1).setValues(chunkArray);
    
    console.log(`Data Mart OLAP sukses di-update! (Terpecah jadi ${chunkArray.length} sel)`);
    return payload;
  }
}