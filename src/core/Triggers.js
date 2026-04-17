// src/core/Triggers.js

class SystemTrigger {
  /**
   * Modul utama untuk Audit Trail. Bersifat Idempotent (Aman dijalankan berkali-kali).
   */
  static runAudit(sheet, rowNumber) {
    const sheetName = sheet.getName();
    
    // Konfigurasi CCTV per tabel. 
    // Sangat modular, tinggal tambah key baru jika ada sheet baru.
    const tableWatchers = {
      [AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_SHEET_NAME]: {
        startRow: AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_START_ROW,
        idCol: AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_ID_COL,
        updatedAtCol: AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_UPDATED_BY_COL
      },
      [AppConfig.DB_BATCH_LOOKUP_SHEET_NAME]: {
        startRow: AppConfig.DB_BATCH_LOOKUP_START_ROW,
        idCol: AppConfig.DB_BATCH_LOOKUP_ID_COL,
        createdAtCol: AppConfig.DB_BATCH_LOOKUP_CREATED_AT_COL,
        updatedAtCol: AppConfig.DB_BATCH_LOOKUP_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_BATCH_LOOKUP_UPDATED_BY_COL
      },
      [AppConfig.DB_CUSTOMER_SHEET_NAME]: {
        startRow: AppConfig.DB_CUSTOMER_START_ROW,
        idCol: AppConfig.DB_CUSTOMER_ID_COL,
        updatedAtCol: AppConfig.DB_CUSTOMER_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_CUSTOMER_UPDATED_BY_COL
      },
      [AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME]: {
        startRow: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_START_ROW,
        idCol: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_ID_COL,
        updatedAtCol: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_UPDATED_BY_COL
      },
      [AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME]: {
        startRow: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_START_ROW,
        idCol: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_ID_COL,
        updatedAtCol: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_UPDATED_BY_COL
      },
      [AppConfig.DB_SHIPPING_LABEL_SHEET_NAME]: {
        startRow: AppConfig.DB_SHIPPING_LABEL_START_ROW,
        idCol: AppConfig.DB_SHIPPING_LABEL_ID_COL,
        updatedAtCol: AppConfig.DB_SHIPPING_LABEL_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_SHIPPING_LABEL_UPDATED_BY_COL
      }
    };

    const config = tableWatchers[sheetName];
    if (!config || rowNumber < config.startRow) return;

    const audit = AppUtils.getAuditTrail();

    // 1. CREATE ONLY: Isi UUID jika kosong
    if (config.idCol) {
      const idCell = sheet.getRange(rowNumber, config.idCol);
      if (!idCell.getValue() || idCell.getValue() === '') {
        idCell.setValue(AppUtils.generateUUID());
      }
    }

    // 2. CREATE ONLY: Isi Created At jika kosong
    // Ini memastikan data lama tidak akan pernah tertimpa.
    if (config.createdAtCol) {
      const createdCell = sheet.getRange(rowNumber, config.createdAtCol);
      if (!createdCell.getValue() || createdCell.getValue() === '') {
        createdCell.setValue(audit.updatedAt);
      }
    }

    // 3. ALWAYS UPDATE: Isi Updated At & By
    if (config.updatedAtCol) {
      sheet.getRange(rowNumber, config.updatedAtCol).setValue(audit.updatedAt);
    }
    if (config.updatedByCol) {
      sheet.getRange(rowNumber, config.updatedByCol).setValue(audit.updatedBy);
    }

// ... (Langkah 1, 2, 3 audit yang sudah ada) ...

    // 4 & 5. INTERCEPTOR: Auto Format PLT & Smart URL
    // Pastikan ini HANYA mengeksekusi sheet PM_BATCH
    if (sheetName === AppConfig.DB_BATCH_LOOKUP_SHEET_NAME) {
      // Index kolom berdasarkan susunan tabel lu
      const batchCol = 8; // Kolom H (batch)
      const urlCol = 16;  // Kolom P (infoUrl)
      const pltCol = 17;  // Kolom Q (dimensionPLT)

      // Auto format PLT (p;l;t -> JSON)
      const pltCell = sheet.getRange(rowNumber, pltCol);
      const currentPlt = pltCell.getValue();
      const formattedPlt = ProductDataHelper.formatPltToJson(currentPlt);
      if (formattedPlt !== currentPlt) {
        pltCell.setValue(formattedPlt);
      }

      // Auto URL Info with Params
      const urlCell = sheet.getRange(rowNumber, urlCol);
      const currentUrl = urlCell.getValue();
      
      const rowData = {
        id: sheet.getRange(rowNumber, config.idCol).getValue(),
        batch: sheet.getRange(rowNumber, batchCol).getValue()
      };

      const smartUrl = ProductDataHelper.generateInfoUrl(currentUrl, rowData);
      if (smartUrl !== currentUrl) {
        urlCell.setValue(smartUrl);
      }
    }

    // 6. Invalidate Global Cache Versioning
    AppUtils.invalidateCache(sheetName);
  }}

// =====================================================================
// ENTRY POINT 1: MANUAL EDIT DI SPREADSHEET
// =====================================================================
function onEdit(e) {
  if (!e) return;
  try {
    SystemTrigger.runAudit(e.source.getActiveSheet(), e.range.getRow());
  } catch (err) {
    console.error("onEdit Trigger Error: " + err.toString());
  }
}

// =====================================================================
// ENTRY POINT 2: APPSHEET SYNC / BACKGROUND INSERT
// =====================================================================
// Tambahkan/Update fungsi onChange di src/core/Triggers.js

function onChange(e) {
  if (!e) return;
  
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Jika ada penambahan baris di tabel FOTO
    if (sheetName === AppConfig.DB_BATCH_FOTO_SHEET_NAME && (e.changeType === 'INSERT_ROW' || e.changeType === 'EDIT')) {
      const activeRange = SpreadsheetApp.getActiveRange();
      const row = activeRange.getRow();
      
      // Ambil batchId dari baris yang baru masuk
      const batchId = sheet.getRange(row, AppConfig.DB_BATCH_FOTO_PARENT_ID_COL).getValue();
      
      if (batchId) {
        // Jalankan sinkronisasi ke parent
        BatchPhotoSync.syncToParent(batchId);
      }
    }
    
    // Tetap jalankan audit normal untuk sheet lain
    if (e.changeType === 'INSERT_ROW' || e.changeType === 'EDIT') {
       SystemTrigger.runAudit(sheet, SpreadsheetApp.getActiveRange().getRow());
    }
  } catch (err) {
    console.error("onChange Error: " + err.toString());
  }
}

// =====================================================================
// INSTALLER: JALANKAN SEKALI DARI EDITOR
// =====================================================================
function setupLayananTrigger() {
  const targetSpreadsheetIds = [
    AppConfig.DB_CUSTOMER_LOOKUP_ID,
    AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_ID,
    AppConfig.DB_SHIPPING_LABEL_ID,
    AppConfig.DB_BATCH_LOOKUP_ID,
    AppConfig.DB_DISTRIBUSI_CURRENT.DB_DISTRIBUSI_CURRENT_ID
  ];

  // Bersihkan trigger lama agar tidak duplikat
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(t => ScriptApp.deleteTrigger(t));

  targetSpreadsheetIds.forEach(ssId => {
    try {
      const ss = SpreadsheetApp.openById(ssId);
      // Pasang CCTV untuk ketikan manual
      ScriptApp.newTrigger('onEdit').forSpreadsheet(ss).onEdit().create();
      // Pasang CCTV untuk AppSheet
      ScriptApp.newTrigger('onChange').forSpreadsheet(ss).onChange().create();
      Logger.log("Berhasil: CCTV (Edit & Change) dipasang di Spreadsheet => " + ss.getName());
    } catch (error) {
      Logger.log("Gagal memasang CCTV di ID: " + ssId + " | Error: " + error.toString());
    }
  });
}

// src/core/CronJobs.js

/**
 * Fungsi ini yang akan dikaitkan ke Time-driven Trigger Google Apps Script.
 * Disarankan berjalan setiap hari pukul 01:00 AM - 02:00 AM.
 */
function scheduledDailyStockSync() {
  try {
    const aggregatorService = new StockAggregatorService();
    aggregatorService.executeDailySync();
  } catch (error) {
    console.error("Cron Job Failed: " + error.toString());
    // Di sini Anda bisa mengimplementasikan notifikasi email ke Admin jika cron job gagal
  }
}