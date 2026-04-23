function sidakDataOLAP() {
  const data = new AnalyticsService().getDashboardAnalytics();
  
  Logger.log("=== SIDAK DATA OLAP HARI INI ===");
  Logger.log("Total Master Produk: " + data.masterProducts.length);
  Logger.log("Total Batch Aktif: " + data.batchMart.length);
  
  // Sidak Pie Chart (Penerimaan vs Distribusi + Stok)
  let totalIn = 0, totalOut = 0, totalStok = 0;
  let batchNganggur = 0; // Gak pernah keluar
  
  data.batchMart.forEach(b => {
    totalIn += b.in;
    totalOut += b.out;
    totalStok += b.stok;
    
    if (!b.lastTrxDate) batchNganggur++;
  });
  
  Logger.log("\n=== BUKTI MATEMATIKA PIE CHART ===");
  Logger.log("Total Penerimaan (In) : " + totalIn);
  Logger.log("Total Distribusi (Out): " + totalOut);
  Logger.log("Total Sisa Stok       : " + totalStok);
  Logger.log("Matematika (Out + Stok == In) -> " + (totalOut + totalStok) + " == " + totalIn);
  
  Logger.log("\n=== ALASAN SLOW MOVING BENGKAK ===");
  Logger.log("Jumlah Batch yang BELUM PERNAH dikeluarin sama sekali (lastTrxDate null): " + batchNganggur);
  
  // Sidak Bar Chart Sektor
  const sektorMap = {};
  data.masterProducts.forEach(p => {
    sektorMap[p.sektor] = (sektorMap[p.sektor] || 0) + 1;
  });
  
  Logger.log("\n=== ALASAN BAR CHART CUMA 'LAINNYA' ===");
  Logger.log("Distribusi Sektor di Master Produk lu: " + JSON.stringify(sektorMap));
}