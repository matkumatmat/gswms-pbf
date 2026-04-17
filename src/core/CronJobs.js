/**
 * Fungsi ini bertindak sebagai entry point untuk pemicu terjadwal (Cron Job).
 * Harus dikaitkan melalui dashboard "Triggers" di editor Apps Script.
 */
function scheduledDailyStockSync() {
  console.log("Memulai sinkronisasi stok harian otomatis...");
  
  try {
    // Pastikan RecordAggregatorService sudah di-push ke Apps Script
    const aggregator = new RecordAggregatorService();
    
    // Menjalankan alur: Load Cold -> Process Hot -> Dump Rekap -> Update Status
    aggregator.executeDailySync();
    
    console.log("Sinkronisasi stok harian selesai dengan sukses.");
  } catch (error) {
    console.error("Gagal menjalankan Sinkronisasi Stok Harian: " + error.toString());
    // Di sini kamu bisa menambahkan fungsi kirim email notifikasi jika terjadi kegagalan
  }
}