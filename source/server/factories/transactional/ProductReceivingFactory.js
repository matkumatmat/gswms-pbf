// source/server/factories/transactional/ProductReceivingFactory.js

const ProductReceivingFactory = (function () {
  const cache = {};

  function getService(year) {
    const key = String(year);
    if (cache[key]) return cache[key];

    const yearCfg = ApplicationConfig.dataSources.transactional
      .find(y => y.year === key);
    if (!yearCfg) throw new Error(`Tahun ${year} tidak dikonfigurasi`);

    const sheetCfg = yearCfg.configs.find(c => c.type === 'ALL_RCV');
    if (!sheetCfg) throw new Error('Konfigurasi ALL_RCV tidak ditemukan');

    const adapter = new TransactionalSheetAdapter(yearCfg, sheetCfg);
    const repo = new TransactionalRepository(adapter);
    const batchSvc = BatchMasterFactory.getService();
    const productSvc = ProductMasterFactory.getService();

    const svc = new ProductReceivingService(yearCfg, sheetCfg, repo, batchSvc, productSvc);
    cache[key] = svc;
    return svc;
  }

  function clearCache() {
    for (const k in cache) delete cache[k];
  }

  return { getService, clearCache };
})();