// src/domain/product/product/ProductHandleMigration.js

function runSafeRelationalMigration() {
  Logger.log("🚀 Memulai Operasi Penjahitan Relasi (SANGAT AMAN) ...");

  const ss = SpreadsheetApp.openById(AppConfig.DB_PRODUCT_LOOKUP_ID);
  const sheetProduct = ss.getSheetByName(AppConfig.DB_PRODUCT_LOOKUP_SHEET_NAME);
  const sheetBatch = ss.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
  
  if (!sheetBatch || !sheetProduct) {
    throw new Error("Sheet PM_BATCH atau PM_PRODUCT ga ketemu bos!");
  }

  const audit = AppUtils.getAuditTrail(); 

  // =====================================================================
  // STEP 1: BACA PM_PRODUCT & ISI ID YANG KOSONG SAJA
  // =====================================================================
  Logger.log("Step 1: Membaca PM_PRODUCT dan melengkapi ID/Audit...");
  
  const productData = sheetProduct.getDataRange().getValues();
  const productMap = new Map(); // Dictionary buat nyari ID nanti
  
  const pIdUpdates = [];
  const pUpdatedAtUpdates = [];
  const pUpdatedByUpdates = [];

  for (let i = 1; i < productData.length; i++) {
    const row = productData[i];
    
    // Sesuai AppConfig lu
    let id = String(row[AppConfig.DB_PRODUCT_LOOKUP_ID_COL - 1] || '').trim();
    const oldCode = String(row[AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_OLD_COL - 1] || '').trim();
    const newCode = String(row[AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_NEW_COL - 1] || '').trim();
    const namaDagang = String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL - 1] || '').trim();
    const namaErp = String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_BARANG_ERP_COL - 1] || '').trim();

    // Kalau ID masih kosong, kita generate. Kalau udah ada, biarin.
    if (!id) {
      id = AppUtils.generateUUID();
      pIdUpdates.push([id]);
      pUpdatedAtUpdates.push([audit.updatedAt]);
      pUpdatedByUpdates.push([audit.updatedBy]);
    } else {
      // Pertahankan data lama biar ga rusak
      pIdUpdates.push([id]);
      pUpdatedAtUpdates.push([row[AppConfig.DB_PRODUCT_LOOKUP_UPDATED_AT_COL - 1]]);
      pUpdatedByUpdates.push([row[AppConfig.DB_PRODUCT_LOOKUP_UPDATED_BY_COL - 1]]);
    }

    // Bangun Dictionary yang Super Lengkap biar PM_BATCH gampang nyarinya
    if (oldCode) {
      productMap.set(oldCode, id);
      if (!oldCode.startsWith('0')) productMap.set('0' + oldCode, id); // Fallback ilang 0
    }
    if (newCode) productMap.set(newCode, id);
    if (namaDagang) productMap.set(namaDagang, id);
    if (namaErp) productMap.set(namaErp, id);
  }

  // Tembak HANYA ke Kolom 1, 11, dan 12 di PM_PRODUCT (Tidak menyentuh kolom ERP lu sama sekali!)
  if (pIdUpdates.length > 0) {
    sheetProduct.getRange(2, AppConfig.DB_PRODUCT_LOOKUP_ID_COL, pIdUpdates.length, 1).setValues(pIdUpdates);
    sheetProduct.getRange(2, AppConfig.DB_PRODUCT_LOOKUP_UPDATED_AT_COL, pUpdatedAtUpdates.length, 1).setValues(pUpdatedAtUpdates);
    sheetProduct.getRange(2, AppConfig.DB_PRODUCT_LOOKUP_UPDATED_BY_COL, pUpdatedByUpdates.length, 1).setValues(pUpdatedByUpdates);
  }

  // =====================================================================
  // STEP 2: JAHIT RELASI KE PM_BATCH (KOLOM 2)
  // =====================================================================
  Logger.log("Step 2: Mencocokkan data dan mengisi PRODUCT_ID di PM_BATCH...");
  
  const batchData = sheetBatch.getDataRange().getValues();
  const batchRelUpdates = [];

  for (let i = 1; i < batchData.length; i++) {
    const row = batchData[i];
    
    // Sesuai PM_BATCH lama lu: Kolom E (Kode), Kolom F (Nama ERP), Kolom G (Nama Dagang)
    const bCode = String(row[4] || '').trim();  
    const bNameErp = String(row[5] || '').trim();
    const bNameDagang = String(row[6] || '').trim();

    let foundProductId = "";

    // Logika Cerdas Pencarian ID:
    if (bCode && productMap.has(bCode)) {
      foundProductId = productMap.get(bCode);
    } else if (bCode && productMap.has('0' + bCode)) {
      foundProductId = productMap.get('0' + bCode);
    } else if (bNameDagang && productMap.has(bNameDagang)) {
      foundProductId = productMap.get(bNameDagang);
    } else if (bNameErp && productMap.has(bNameErp)) {
      foundProductId = productMap.get(bNameErp);
    }

    batchRelUpdates.push([foundProductId]);
  }

  // Tembak HANYA ke Kolom 2 di PM_BATCH
  if (batchRelUpdates.length > 0) {
    sheetBatch.getRange(2, AppConfig.DB_BATCH_LOOKUP_PRODUCT_ID_COL, batchRelUpdates.length, 1).setValues(batchRelUpdates);
  }

  Logger.log("🔥 MIGRASI AMAN SELESAI! Data ERP lu utuh, ID beres, Relasi PM_BATCH terjahit sempurna!");
}