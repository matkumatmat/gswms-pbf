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

  getDashboardAnalytics() {
    // 1. Tarik Katalog Produk (Kirim ID nya)
    const rawProducts = this.productRepo.getAllProductRaw();
    const rawProductsMapped = AppUtils.mapArrayToObject(rawProducts, ProductRepo.TABLE_KEYS);
    const products = [];

    rawProductsMapped.forEach(p => {
      if (!p.id) return;
      const oldCode = String(p.kodeBarang || '').trim();
      const newCode = String(p.kodeBarangNew || '').trim();
      products.push({
        id: p.id,
        kodeBarang: (newCode && newCode !== '-') ? newCode : oldCode,
        namaDagang: p.namaDagang
      });
    });

    // 2. Tarik Batch (Kirim Product ID nya, Ini Kunci Utamanya!)
    const rawBatches = this.batchRepo.getAllBatchLookupRaw();
    const batches = AppUtils.mapArrayToObject(rawBatches, BatchRepo.TABLE_KEYS).map(b => ({
      batch: String(b.batch || '').trim().toUpperCase(),
      sysStatus: b.sysStatus,
      productId: b.productId
    }));

    // 3. Tarik Transaksi Hot Storage
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
          const batch = String(row[map.batch - 1] || '').trim().toUpperCase();
          const ket = String(row[map.keterangan - 1] || '').toUpperCase();
          const kons = String(row[map.namaKonsumen - 1] || '').toUpperCase();
          
          if (!batch || batch === 'BATCH' || batch === 'BATCH NUMBER') continue;
          if (ket.includes('REVISI') || kons.includes('SALDO AWAL')) continue;
          if (batch.includes('PENERIMAAN') || batch.includes('DISTRIBUSI') || batch.includes('STOK') || batch.includes('TERSERAP') || batch.includes('TOTAL')) continue;

          hotTransactions.push({
            tanggal: row[map.tanggal - 1], 
            batch: batch,
            in: this._parseIdn(row[map.penerimaan - 1]),
            out: this._parseIdn(row[map.distribusi - 1])
          });
        }
    }

    // 4. Tarik Cold Storage Rekap
    const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const sheetCold = ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    const coldAggregations = [];
    
    if (sheetCold && sheetCold.getLastRow() > 1) {
        const rawCold = sheetCold.getRange(2, 1, sheetCold.getLastRow() - 1, sheetCold.getLastColumn()).getValues();
        for(let i = 0; i < rawCold.length; i++){
            const batch = String(rawCold[i][0] || '').trim().toUpperCase();
            
            if (!batch || batch === 'BATCH' || batch === '-') continue;
            if (batch.includes('PENERIMAAN') || batch.includes('DISTRIBUSI') || batch.includes('STOK') || batch.includes('TERSERAP') || batch.includes('TOTAL')) continue;

            coldAggregations.push({
                batch: batch,
                in: this._parseIdn(rawCold[i][2]),
                out: this._parseIdn(rawCold[i][3])
            });
        }
    }

    return { products, batches, hotTransactions, coldAggregations };
  }
}