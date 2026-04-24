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
// ====================================================================
  // WRITE: Ngitung, Mutilasi (Chunking), & Simpan JSON (The Worker 👷)
  // ====================================================================
  buildAndSaveDashboardSummary() {
    console.log("Memulai kompilasi Data Mart...");
    
    // 1. Master Produk
    const rawProducts = this.productRepo.getAllProductRaw();
    const productsMapped = AppUtils.mapArrayToObject(rawProducts, ProductRepo.TABLE_KEYS);
    const masterProducts = productsMapped.map(p => ({
      pId: p.id,
      kode: (p.kodeBarangNew && p.kodeBarangNew !== '-') ? p.kodeBarangNew : p.kodeBarang,
      nama: p.namaDagang,
      kat: p.kategori && p.kategori !== '-' ? p.kategori : 'TIDAK ADA KATEGORI' 
    }));

    // 2. Mapping Batch pakai ID
    const rawBatches = this.batchRepo.getAllBatchLookupRaw();
    const batches = AppUtils.mapArrayToObject(rawBatches, BatchRepo.TABLE_KEYS);
    
    const batchMartMap = new Map();
    const batchSearchIndex = new Map(); 
    
    batches.forEach(b => {
      const batchObj = {
        id: b.id,
        b: String(b.batch || '-').toUpperCase().trim(),
        pId: b.productId,
        sys: b.sysStatus || 'UNKNOWN',
        ed: b.expiryDate || null,
        rcv: b.createdAt || new Date().toISOString(),
        rslBln: b.rslBulan || 0,
        in: 0, out: 0, stok: 0,
        firstInDate: null, 
        lastOutDate: null, 
        trxByMonth: {} 
      };
      
      batchMartMap.set(b.id, batchObj);
      
      const prod = masterProducts.find(p => p.pId === b.productId);
      const kode = prod ? prod.kode : '';
      batchSearchIndex.set(`${kode}_${batchObj.b}`.toUpperCase(), b.id);
      if (!batchSearchIndex.has(batchObj.b)) batchSearchIndex.set(batchObj.b, b.id);
    });

    // 3. Transaksi Hot
    const ssHot = SpreadsheetApp.openById(this.hotConfig.DB_DISTRIBUSI_CURRENT_ID);
    const sheetHot = ssHot.getSheetByName(this.hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);
    const rawHot = sheetHot.getRange(this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW, 1, sheetHot.getLastRow(), sheetHot.getLastColumn()).getValues();
    const map = this.hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;

    for (let row of rawHot) {
      const bNo = String(row[map.batch - 1] || '').trim().toUpperCase();
      const kBrg = String(row[map.kodeBarang - 1] || '').trim().toUpperCase();
      
      let targetId = batchSearchIndex.get(`${kBrg}_${bNo}`) || batchSearchIndex.get(bNo);
      if (!targetId || !batchMartMap.has(targetId)) continue;

      const bm = batchMartMap.get(targetId);
      const qIn = this._parseIdn(row[map.penerimaan - 1]);
      const qOut = this._parseIdn(row[map.distribusi - 1]);
      const tglRaw = row[map.tanggal - 1];

      bm.in += qIn; bm.out += qOut; bm.stok = bm.in - bm.out;

      if (tglRaw instanceof Date && !isNaN(tglRaw.getTime())) {
        const tglIso = tglRaw.toISOString();
        const mKey = `${tglRaw.getFullYear()}-${String(tglRaw.getMonth() + 1).padStart(2, '0')}`;
        
        if (!bm.trxByMonth[mKey]) bm.trxByMonth[mKey] = { in: 0, out: 0, firstIn: null, lastOut: null };
        
        bm.trxByMonth[mKey].in += qIn;
        bm.trxByMonth[mKey].out += qOut;

        if (qIn > 0) {
          if (!bm.firstInDate || tglRaw < new Date(bm.firstInDate)) bm.firstInDate = tglIso;
          if (!bm.trxByMonth[mKey].firstIn || tglRaw < new Date(bm.trxByMonth[mKey].firstIn)) bm.trxByMonth[mKey].firstIn = tglIso;
        }

        if (qOut > 0) {
          if (!bm.lastOutDate || tglRaw > new Date(bm.lastOutDate)) bm.lastOutDate = tglIso;
          if (!bm.trxByMonth[mKey].lastOut || tglRaw > new Date(bm.trxByMonth[mKey].lastOut)) bm.trxByMonth[mKey].lastOut = tglIso;
        }
      }
    }

    // 4. THE FIX: Merge Cold Storage DARI SUMBER MENTAH (Biar dapet EXACT DATE 2025!)
    const coldConfigs = AppConfig.DB_DISTRIBUSI_COLD || [];
    for (let cConfig of coldConfigs) {
      if (!cConfig.DB_DISTRIBUSI_ID || cConfig.DB_DISTRIBUSI_ID === 'NOT_SET_YET') continue;
      
      try {
        const ssCold = SpreadsheetApp.openById(cConfig.DB_DISTRIBUSI_ID);
        const sheetCold = ssCold.getSheetByName(cConfig.DB_DISTRIBUSI_SHEET_NAME);
        if (!sheetCold) continue;

        const rawCold = sheetCold.getRange(cConfig.DB_DISTRIBUSI_START_ROW, 1, sheetCold.getLastRow(), sheetCold.getLastColumn()).getValues();
        const mapCold = cConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;

        for (let row of rawCold) {
          const bNo = String(row[mapCold.batch - 1] || '').trim().toUpperCase();
          const kBrg = String(row[mapCold.kodeBarang - 1] || '').trim().toUpperCase();
          
          let targetId = batchSearchIndex.get(`${kBrg}_${bNo}`) || batchSearchIndex.get(bNo);
          if (!targetId || !batchMartMap.has(targetId)) continue;

          const bm = batchMartMap.get(targetId);
          const qIn = this._parseIdn(row[mapCold.penerimaan - 1]);
          const qOut = this._parseIdn(row[mapCold.distribusi - 1]);
          const tglRaw = row[mapCold.tanggal - 1];

          bm.in += qIn; bm.out += qOut; bm.stok = bm.in - bm.out;

          // NANGKAP TANGGAL EXACT DARI TAHUN 2025!
          if (tglRaw instanceof Date && !isNaN(tglRaw.getTime())) {
            const tglIso = tglRaw.toISOString();
            const mKey = `${tglRaw.getFullYear()}-${String(tglRaw.getMonth() + 1).padStart(2, '0')}`;
            
            if (!bm.trxByMonth[mKey]) bm.trxByMonth[mKey] = { in: 0, out: 0, firstIn: null, lastOut: null };
            
            bm.trxByMonth[mKey].in += qIn;
            bm.trxByMonth[mKey].out += qOut;

            if (qIn > 0) {
              if (!bm.firstInDate || tglRaw < new Date(bm.firstInDate)) bm.firstInDate = tglIso;
              if (!bm.trxByMonth[mKey].firstIn || tglRaw < new Date(bm.trxByMonth[mKey].firstIn)) bm.trxByMonth[mKey].firstIn = tglIso;
            }

            if (qOut > 0) {
              if (!bm.lastOutDate || tglRaw > new Date(bm.lastOutDate)) bm.lastOutDate = tglIso;
              if (!bm.trxByMonth[mKey].lastOut || tglRaw > new Date(bm.trxByMonth[mKey].lastOut)) bm.trxByMonth[mKey].lastOut = tglIso;
            }
          }
        }
      } catch(e) {
        console.error("Gagal baca Cold Storage:", e);
      }
    }

    const payload = {
      lastSync: new Date().toISOString(),
      masterProducts: masterProducts,
      batchMart: Array.from(batchMartMap.values())
    };

    const jsonString = JSON.stringify(payload);
    const chunkSize = 45000; 
    const chunkArray = [];

    for (let i = 0; i < jsonString.length; i += chunkSize) {
      chunkArray.push([jsonString.substring(i, i + chunkSize)]);
    }

    const ssOlap = SpreadsheetApp.openById(AppConfig.DB_OLAP_DATA_ID);
    const sheetOlap = ssOlap.getSheetByName(AppConfig.DB_OLAP_DATA_SHEET_NAME);
    sheetOlap.clearContents();
    sheetOlap.getRange(1, 1, chunkArray.length, 1).setValues(chunkArray);
    
    console.log(`Data Mart OLAP sukses di-update!`);
    return payload;
  }
  
}