// src/migration/ArchiverMigration.js

function runArchiverMigration() {
  Logger.log("Mulai patroli nyapu ranjau dan nge-flag Batch di PM_BATCH...");

  // 1. Buka Sheet Master dan Rekap
  const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  const sheetBatch = ssMaster.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
  const sheetRekap = ssMaster.getSheetByName(AppConfig.DB_STOK_REKAP_SHEET_NAME);

  if (!sheetBatch || !sheetRekap) {
    Logger.log("Waduh, Sheet PM_BATCH atau PM_STOK_REKAP ga ketemu!");
    return;
  }

  // 2. Tarik Data Rekap (Buat contekan sisa stok)
  // Kita jadiin Map biar nyarinya ngebut hitungan milidetik
  const rekapData = sheetRekap.getDataRange().getValues();
  const stockMap = new Map();
  
  // Mulai dari 1 buat nge-skip baris header rekap
  for (let i = 1; i < rekapData.length; i++) {
    const batchNo = String(rekapData[i][0]).trim(); // Kolom A (BATCH)
    const stokAkhir = parseFloat(rekapData[i][4]) || 0; // Kolom E (STOK)
    stockMap.set(batchNo, stokAkhir);
  }

  // 3. Tarik Data PM_BATCH
  const startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
  const lastRow = sheetBatch.getLastRow();
  
  if (lastRow < startRow) {
    Logger.log("Data PM_BATCH kosong.");
    return;
  }

  const batchData = sheetBatch.getRange(
    startRow, 
    1, 
    lastRow - startRow + 1, 
    sheetBatch.getLastColumn()
  ).getValues();

  // Indexing Kolom (Kurangin 1 karena array mulai dari 0)
  const batchIdx = AppConfig.DB_BATCH_LOOKUP_BATCH_COL - 1;
  const expIdx = AppConfig.DB_BATCH_LOOKUP_EXPIRY_DATE_COL - 1;
  const statusIdx = AppConfig.DB_BATCH_LOOKUP_SYS_STATUS_COL - 1;

  // Set jam hari ini ke 00:00:00 buat perbandingan expiry yang adil
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let updateCount = 0;

  // 4. Looping Eksekusi (Sidang Penentuan Status)
  for (let i = 0; i < batchData.length; i++) {
    const row = batchData[i];
    const batchNo = String(row[batchIdx] || '').trim();
    
    if (!batchNo) continue; // Skip kalau nomor batch kosong

    const expDate = new Date(row[expIdx]);
    const currentStatus = String(row[statusIdx] || '').toUpperCase();
    let newStatus = currentStatus;

    // Ambil stok dari contekan (Kalau ga ada mutasi, anggep 0)
    const stock = stockMap.has(batchNo) ? stockMap.get(batchNo) : 0;
    const isExpired = expDate < today;

    // RULES PRIORITAS
    if (stock < 0) {
      newStatus = 'ANOMALI';
    } else if (isExpired) {
      newStatus = 'EXPIRED';
    } else if (stock === 0) {
      newStatus = 'CLOSED';
    } else {
      newStatus = 'ACTIVE'; // Kalau stok > 0 dan belum expired
    }

    // Kalau statusnya berubah, kita catat buat di-update
    if (newStatus !== currentStatus) {
      batchData[i][statusIdx] = newStatus;
      updateCount++;
    }
  }

  // 5. Tumpahin Data yang Udah Di-stempel Balik ke PM_BATCH
  if (updateCount > 0) {
    Logger.log(`Nemu ${updateCount} batch yang butuh ganti stempel. Menyimpan perubahan...`);
    sheetBatch.getRange(startRow, 1, batchData.length, batchData[0].length).setValues(batchData);
    Logger.log(`🔥 BERES! Database PM_BATCH lu udah bersih, rapi, dan ter-filter.`);
  } else {
    Logger.log("Semua status batch udah akurat. Ga ada yang perlu diupdate.");
  }
}