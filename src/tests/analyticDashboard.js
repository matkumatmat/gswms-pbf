// src/tests/test_analytics_debug.js

function debugAnalyticsMismatch() {
  try {
    Logger.log("Memulai Debugging AnalyticsService...");
    
    // 1. Inisialisasi Service
    const service = new AnalyticsService();
    const data = service.getDashboardAnalytics();

    Logger.log("=== SUMMARY DATA ===");
    Logger.log("Total Master Products: " + data.products.length);
    Logger.log("Total Master Batches: " + data.batches.length);
    Logger.log("Total Hot Trx (2026): " + data.hotTransactions.length);
    Logger.log("Total Cold Aggregations: " + data.coldAggregations.length);

    // 2. Simulasi Pencocokan (Cross-Referencing)
    const productMap = new Map();
    data.products.forEach(p => {
      // Simpan menggunakan uppercase untuk mengecek masalah case-sensitive
      const kode = String(p.kodeBarang).trim().toUpperCase();
      productMap.set(kode, p.namaDagang);
    });

    const unmappedTransactions = [];
    const uniqueUnmappedKodes = new Set();

    // 3. Sidak Hot Transactions
    data.hotTransactions.forEach(trx => {
      const kodeTrx = String(trx.kodeBarang).trim().toUpperCase();
      if (!productMap.has(kodeTrx)) {
        uniqueUnmappedKodes.add(kodeTrx);
        // Ambil sample maksimal 20 transaksi nyasar
        if (unmappedTransactions.length < 20) {
          unmappedTransactions.push({
            sumber: "HOT",
            batch: trx.batch,
            kodeTrx: trx.kodeBarang,
            in: trx.in,
            out: trx.out
          });
        }
      }
    });

    // 4. Sidak Cold Aggregations
    data.coldAggregations.forEach(trx => {
      const kodeTrx = String(trx.kodeBarang).trim().toUpperCase();
      if (!productMap.has(kodeTrx)) {
        uniqueUnmappedKodes.add(kodeTrx);
        if (unmappedTransactions.length < 20) {
          unmappedTransactions.push({
            sumber: "COLD",
            batch: trx.batch,
            kodeTrx: trx.kodeBarang,
            in: trx.in,
            out: trx.out
          });
        }
      }
    });

    // 5. Susun Laporan untuk dianalisa
    const debugReport = {
      status: "SUCCESS",
      mismatchCount: uniqueUnmappedKodes.size,
      unmappedKodeBarang: Array.from(uniqueUnmappedKodes),
      sampleUnmappedTransactions: unmappedTransactions,
      sampleMasterProducts: data.products.slice(0, 5) // Ambil 5 produk untuk ngecek format aslinya
    };

    Logger.log("=== HASIL DEBUG UNTUK GEMINI ===");
    Logger.log(JSON.stringify(debugReport, null, 2));

  } catch (error) {
    Logger.log("ERROR SAAT DEBUGGING: " + error.toString());
    Logger.log(error.stack);
  }
}