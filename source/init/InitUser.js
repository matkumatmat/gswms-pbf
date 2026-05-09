// source/init/InitUser.js
/**
 * Buat user admin pertama kali.
 * Jalankan sekali dari editor Apps Script.
 */
function createInitialAdmin() {
  const config = ApplicationConfig.dataSources.user;
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.sheetName);
  
  // Pastikan header sudah ada (asumsikan sudah ada)
  const email = "admin@pbf.com";
  const rawPassword = "Admin123!";
  
  // Panggil fungsi hash dari AuthService (asumsi sudah ada di src/core/AuthService.js)
  // TAPI karena AuthService menggunakan AppConfig lama, kita perlu sementara panggil manual
  // Atau kita buat fungsi hash sederhana di sini untuk keperluan init.
  // Karena AuthService belum di-refactor, saya asumsikan nanti akan dipanggil.
  // Untuk sementara, tulis perintah agar user menjalankan fungsi dari editor nanti.
  
  Logger.log("Jalankan fungsi ini setelah AuthService siap. Gunakan script: initialAdminSetup() di src/tests/InitUser.js");
}

// Atau gunakan fungsi yang sudah ada di src/tests/InitUser.js, tinggal panggil dari editor.