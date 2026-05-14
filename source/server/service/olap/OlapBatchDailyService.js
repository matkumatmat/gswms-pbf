/**
 * Service pipeline untuk membangun ulang (rebuild) sheet OLAP_BATCH_DAILY.
 * Agregasi total penerimaan, total distribusi, dan stok akhir per batch
 * dari seluruh transaksi produk (DIST, RCV, CONS) tanpa dimensi waktu.
 *
 * @param {ProductHistoryReaderAdapter} historyAdapter
 * @param {BatchMasterService} batchService
 * @param {ProductMasterService} productService
 * @param {OlapBatchDailyRepository} olapRepo
 */
function OlapBatchDailyPipelineService(historyAdapter, batchService, productService, olapRepo) {

  /**
   * Hapus cache transaksi & history agar rebuild pakai data terbaru.
   */
  function _invalidateHistoryCaches() {
    TransactionalFactory.clearCache();
    var years = ['2025', '2026'];
    var types = ['ALL_DIST', 'ALL_RCV', 'ALL_CONS'];
    years.forEach(function(year) {
      types.forEach(function(type) {
        var cacheGroup = CacheManager.resolveCacheGroup({
          domain: 'transactional',
          spreadsheetId: ApplicationConfig.dataSources.transactional
            .find(y => y.year === year).spreadsheetId,
          sheetName: type,
          year: year,
          type: type
        });
        CacheManager.invalidate(cacheGroup);
      });
    });
    CacheManager.invalidate('HISTORY_PRODUCT');
  }

  this.rebuild = function() {
    _invalidateHistoryCaches();

    // 1. Ambil semua transaksi
    const allTx = historyAdapter.getAll();
    if (!allTx || allTx.length === 0) {
      Logger.log('[OlapBatchDaily] Tidak ada transaksi. Sheet OLAP akan dikosongkan.');
      olapRepo.overwriteAll([]);
      olapRepo.updateGlobalCells(new Date(), 'SYSTEM');
      return;
    }

    // 2. Muat master batch & produk
    const batchList = batchService.getAll();      // sudah terfilter ACTIVE saja?
    const productList = productService.getAll();

    const productMap = new Map();
    productList.forEach(p => { if (p.id) productMap.set(p.id, p); });

    // Untuk lookup batch via nama (digunakan saat transaksi tidak punya batchId)
    const batchByName = new Map();
    batchList.forEach(b => {
      if (b.id && b.batch) batchByName.set(b.batch.trim().toUpperCase(), b);
    });

    // 3. Siapkan wadah agregasi per batchId
    const aggMap = new Map(); // key: batchId, value: { penerimaan, distribusi, stokAkhir }
    batchList.forEach(b => {
      if (b.id) {
        aggMap.set(b.id, { penerimaan: 0, distribusi: 0, stokAkhir: 0 });
      }
    });

    // 4. Iterasi transaksi, akumulasi
    for (const item of allTx) {
      const record = item.record;
      let batchId = null;

      // Tentukan batchId
      if (item.sheetType === 'ALL_RCV') {
        batchId = record.batchId;
        if (!batchId && record.batch) {
          const found = batchByName.get(String(record.batch).trim().toUpperCase());
          batchId = found ? found.id : null;
        }
      } else {
        const batchNo = String(record.batch || '').trim();
        if (batchNo) {
          const found = batchByName.get(batchNo.toUpperCase());
          batchId = found ? found.id : null;
        }
      }
      if (!batchId) continue;

      // Pastikan batchId ada di aggMap (mungkin batch baru yang belum ada di master? skip)
      if (!aggMap.has(batchId)) continue;

      const agg = aggMap.get(batchId);

      if (item.sheetType === 'ALL_RCV') {
        const qty = NumberUtils.toNumber(record.jumlahFisik || 0);
        agg.penerimaan += qty;
        agg.stokAkhir += qty;   // stok bertambah
      } else {
        const qty = NumberUtils.toNumber(record.distribusi || 0);
        agg.distribusi += qty;
        agg.stokAkhir -= qty;   // stok berkurang
      }
    }

    // 5. Susun output per batch
    const outputRows = [];
    for (const [batchId, agg] of aggMap.entries()) {
      const batch = batchList.find(b => b.id === batchId);
      if (!batch) continue;

      const product = productMap.get(batch.productId);
      if (!product) continue;

      outputRows.push({
        id: AppUtils.generateUUID(),
        productId: product.id,
        batchId: batch.id,
        SysStatus: batch.SysStatus || null,
        status: batch.status || null,
        kodeBarang: product.kodeBarangNew || product.kodeBarang || '',
        namaBarang: product.namaBarangNew || product.namaBarang || '',
        batch: batch.batch || '',
        mfgDate: batch.mfgDate ? DateUtils.formatYYYYMMDD(batch.mfgDate) : null,
        expireDate: batch.expireDate ? DateUtils.formatYYYYMMDD(batch.expireDate) : null,
        penerimaan: agg.penerimaan,
        distribusi: agg.distribusi,
        stokAkhir: agg.stokAkhir,
        batchJsonDetail: JSON.stringify({
          product: {
            id: product.id,
            kodeBarang: product.kodeBarangNew || product.kodeBarang,
            namaBarang: product.namaBarangNew || product.namaBarang,
            hjp: product.Hjp,
            het: product.Het,
            kategori: product.kategori,
            suhu: product.suhu,
            satuan: product.satuan
          },
          batch: {
            id: batch.id,
            batch: batch.batch,
            mfgDate: batch.mfgDate ? DateUtils.formatYYYYMMDD(batch.mfgDate) : null,
            expireDate: batch.expireDate ? DateUtils.formatYYYYMMDD(batch.expireDate) : null,
            status: batch.status,
            SysStatus: batch.SysStatus,
            rslBulan: batch.rslBulan,
            rslHari: batch.rslHari,
            nomorIzinEdar: batch.nomorIzinEdar,
            vvmStatus: batch.vvmStatus
          }
        })
      });
    }

    // 6. Tulis ke sheet
    olapRepo.overwriteAll(outputRows);
    olapRepo.updateGlobalCells(new Date(), 'SYSTEM');

    // 7. Invalidasi cache OLAP
    const olapCfg = ApplicationConfig.dataSources.olap.configs.find(c => c.type === 'OLAP_BATCH_DAILY');
    const cacheGroup = CacheManager.resolveCacheGroup({
      domain: 'olap',
      spreadsheetId: ApplicationConfig.dataSources.olap.spreadsheetId,
      sheetName: olapCfg.sheetName
    });
    CacheManager.invalidate(cacheGroup);

    Logger.log('[OlapBatchDaily] Rebuild selesai. Total baris: ' + outputRows.length);
  };
}