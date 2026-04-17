// src/migration/InitialFillDistribusiAudit.js

function runFillDistribusiAudit() {
  Logger.log("Mulai sidak data 2026 buat ngisi KTP (UUID) & Audit...");

  const config = AppConfig.DB_DISTRIBUSI_CURRENT;
  const ss = SpreadsheetApp.openById(config.DB_DISTRIBUSI_CURRENT_ID);
  const sheet = ss.getSheetByName(config.DB_DISTRIBUSI_CURRENT_SHEET_NAME);

  if (!sheet) {
    Logger.log("Sheet 2026 ga ketemu bos!");
    return;
  }

  const lastRow = sheet.getLastRow();
  const startRow = config.DB_DISTRIBUSI_CURRENT_START_ROW;
  
  if (lastRow < startRow) {
    Logger.log("Data kosong.");
    return;
  }

  const maxCols = sheet.getLastColumn();
  
  // 1. Tarik semua data ke RAM biar kenceng (In-Memory)
  const range = sheet.getRange(startRow, 1, lastRow - startRow + 1, maxCols);
  const data = range.getValues();

  // Ambil email sistem/admin buat updatedBy
  const audit = AppUtils.getAuditTrail();
  let updateCount = 0;

  // Index array (Ingat: Index Array = Nomor Kolom - 1)
  const idIdx = config.DB_DISTRIBUSI_CURRENT_ID_COL - 1;
  const updatedIdx = config.DB_DISTRIBUSI_CURRENT_UPDATED_AT_COL - 1;
  const userIdx = config.DB_DISTRIBUSI_CURRENT_UPDATED_BY_COL - 1;

  // 2. Looping brutal cek baris per baris
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Cek apakah kolom ID kosong
    if (!row[idIdx] || row[idIdx] === '') {
      data[i][idIdx] = AppUtils.generateUUID(); // Kasih KTP (UUID)
      data[i][updatedIdx] = audit.updatedAt;    // Kasih Timestamp
      data[i][userIdx] = audit.updatedBy;       // Kasih TTD Email
      
      updateCount++;
    }
  }

  // 3. Tumpahin balik ke Spreadsheet SEKALIGUS kalau ada yang diupdate
  if (updateCount > 0) {
    Logger.log(`Nemu ${updateCount} baris ilegal. Memproses suntik UUID...`);
    range.setValues(data);
    Logger.log(`🔥 BERES! ${updateCount} baris udah punya KTP & Audit Trail resmi.`);
  } else {
    Logger.log("Semua baris udah punya UUID. Aman bos!");
  }
}