// src/domain/analytics/AnalyticsService.js

class AnalyticsService {
  constructor() {
    this.hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
    this.productRepo = new ProductRepo();
    this.batchRepo = new BatchRepo();
  }

  // Helper untuk normalisasi format angka Indonesia ke format float kalkulasi
  _parseIdn(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  getDashboardAnalytics() {
    // 1. Tarik Katalog Produk & Buat Translator Kode (Normalizer)
    const rawProducts = this.productRepo.getAllProductRaw();
    const rawProductsMapped = AppUtils.mapArrayToObject(rawProducts, ProductRepo.TABLE_KEYS);
    
    const productLookupMap = new Map(); // Translator: Semua variasi kode -> Unified Code
    const products = []; // List produk bersih untuk Frontend

    rawProductsMapped.forEach(p => {
      const oldCode = String(p.kodeBarang || '').trim(); // Mengacu ke TABLE_KEYS yang benar
      const newCode = String(p.kodeBarangNew || '').trim();
      const nama = String(p.namaDagang || '').trim();

      // Tentukan Unified Code (Prioritaskan kode baru, jika tidak ada pakai kode lama)
      const unifiedCode = (newCode && newCode !== '-') ? newCode : oldCode;
      
      if (!unifiedCode || unifiedCode === '-') return;

      // Daftarkan semua kemungkinan ke dictionary
      if (oldCode && oldCode !== '-') productLookupMap.set(oldCode.toUpperCase(), unifiedCode);
      if (newCode && newCode !== '-') productLookupMap.set(newCode.toUpperCase(), unifiedCode);
      if (nama && nama !== '-') productLookupMap.set(nama.toUpperCase(), unifiedCode);

      // Simpan data bersih untuk dikirim ke Dashboard UI
      products.push({
        kodeBarang: unifiedCode,
        namaDagang: p.namaDagang
      });
    });

    // 2. Tarik Status Batch Aktif/Inactive
    const rawBatches = this.batchRepo.getAllBatchLookupRaw();
    const batches = AppUtils.mapArrayToObject(rawBatches, BatchRepo.TABLE_KEYS).map(b => ({
      batch: b.batch,
      sysStatus: b.sysStatus
    }));

    // 3. Tarik & Terjemahkan Transaksi Hot Storage (Tahun Ini)
    const ssHot = SpreadsheetApp.openById(this.hotConfig.DB_DISTRIBUSI_CURRENT_ID);
    const sheetHot = ssHot.getSheetByName(this.hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);
    const startRowHot = this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW;
    const numRowsHot = sheetHot.getLastRow() - startRowHot + 1;
    
    const hotTransactions = [];
    if (numRowsHot > 0) {
        const rawHot = sheetHot.getRange(startRowHot, 1, numRowsHot, sheetHot.getLastColumn()).getValues();
        const map = this.hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
        
        for (let i = 0; i < rawHot.length; i++) {
          const row = rawHot[i];
          const batch = String(row[map.batch - 1] || '').trim();
          const ket = String(row[map.keterangan - 1] || '').toUpperCase();
          const kons = String(row[map.namaKonsumen - 1] || '').toUpperCase();
          
          // BLOKIR BARIS HANTU: Tolak baris kosong, header, revisi, dan saldo awal
          if (!batch || batch.toUpperCase() === 'BATCH' || batch.toUpperCase() === 'BATCH NUMBER') continue;
          // if (ket.includes('REVISI') || kons.includes('SALDO AWAL')) continue;

          // TERJEMAHKAN KODE: Cari dari map, jika tidak ada pakai kode aslinya
          const rawKode = String(row[map.kodeBarang - 1] || '-').trim().toUpperCase();
          const unifiedKode = productLookupMap.get(rawKode) || rawKode;

          hotTransactions.push({
            tanggal: row[map.tanggal - 1], 
            kodeBarang: unifiedKode,
            batch: batch,
            in: this._parseIdn(row[map.penerimaan - 1]),
            out: this._parseIdn(row[map.distribusi - 1])
          });
        }
    }

    // 4. Tarik & Terjemahkan Cold Storage Rekap
    const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const sheetCold = ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    let coldAggregations = [];
    
    if (sheetCold && sheetCold.getLastRow() > 1) {
        const rawCold = sheetCold.getRange(2, 1, sheetCold.getLastRow() - 1, sheetCold.getLastColumn()).getValues();
        for(let i = 0; i < rawCold.length; i++){
            const batch = String(rawCold[i][0] || '').trim();
            
            if (!batch || batch.toUpperCase() === 'BATCH' || batch === '-') continue;

            const rawKode = String(rawCold[i][1] || '-').trim().toUpperCase();
            const unifiedKode = productLookupMap.get(rawKode) || rawKode;

            coldAggregations.push({
                batch: batch,
                kodeBarang: unifiedKode,
                in: this._parseIdn(rawCold[i][2]),
                out: this._parseIdn(rawCold[i][3])
            });
        }
    }

    return {
      products: products,
      batches: batches,
      hotTransactions: hotTransactions,
      coldAggregations: coldAggregations
    };
  }
}