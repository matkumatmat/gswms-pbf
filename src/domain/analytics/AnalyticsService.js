// src/domain/analytics/AnalyticsService.js

class AnalyticsService {
  constructor() {
    this.hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
    // Panggil repo yang udah ada
    this.productRepo = new ProductRepo();
    this.batchRepo = new BatchRepo();
  }

  getDashboardAnalytics() {
    // 1. Tarik Katalog Produk (Buat mapping Nama & Kode)
    const rawProducts = this.productRepo.getAllProductRaw();
    const products = AppUtils.mapArrayToObject(rawProducts, ProductRepo.TABLE_KEYS).map(p => ({
      kodeBarang: p.kodeBarangNew !== '-' ? p.kodeBarangNew : p.kodeBarangOld,
      namaDagang: p.namaDagang
    }));

    // 2. Tarik Status Batch Aktif/Inactive
    const rawBatches = this.batchRepo.getAllBatchLookupRaw();
    const batches = AppUtils.mapArrayToObject(rawBatches, BatchRepo.TABLE_KEYS).map(b => ({
      batch: b.batch,
      sysStatus: b.sysStatus
    }));

    // 3. Tarik Transaksi REAL-TIME (Tahun Ini / Hot Storage)
    const ssHot = SpreadsheetApp.openById(this.hotConfig.DB_DISTRIBUSI_CURRENT_ID);
    const sheetHot = ssHot.getSheetByName(this.hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);
    const rawHot = sheetHot.getRange(this.hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW, 1, sheetHot.getLastRow(), sheetHot.getLastColumn()).getValues();
    const map = this.hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
    
    const hotTransactions = [];
    for (let i = 0; i < rawHot.length; i++) {
      const row = rawHot[i];
      const batch = String(row[map.batch - 1] || '').trim();
      const ket = String(row[map.keterangan - 1] || '').toUpperCase();
      const kons = String(row[map.namaKonsumen - 1] || '').toUpperCase();
      
      // if (!batch || ket.includes('REVISI') || kons.includes('SALDO AWAL')) continue;
      if (!batch || ket.includes('REVISI')) continue;

      hotTransactions.push({
        tanggal: row[map.tanggal - 1], // Kirim raw date
        kodeBarang: String(row[map.kodeBarang - 1] || '-').trim(),
        batch: batch,
        in: parseFloat(row[map.penerimaan - 1]) || 0,
        out: parseFloat(row[map.distribusi - 1]) || 0
      });
    }

    // (Opsional) 4. Tarik Cold Storage Rekap jika butuh data "Tahun Lalu"
    // Untuk performa, cukup tarik dari sheet rekap COLD yang udah lu bikin di CronJob
    const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const sheetCold = ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    let coldAggregations = [];
    if (sheetCold) {
        const rawCold = sheetCold.getDataRange().getValues();
        for(let i=1; i<rawCold.length; i++){
            coldAggregations.push({
                batch: String(rawCold[i][0]),
                kodeBarang: String(rawCold[i][1]),
                in: parseFloat(rawCold[i][2]) || 0,
                out: parseFloat(rawCold[i][3]) || 0
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