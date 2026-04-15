// src/core/Triggers.js

function onEdit(e) {
  if (!e) return; 

  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    const range = e.range;
    const row = range.getRow();

    const tableWatchers = {
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
      },
      [AppConfig.DB_BATCH_LOOKUP_SHEET_NAME]: {
        startRow: AppConfig.DB_BATCH_LOOKUP_START_ROW,
        idCol: AppConfig.DB_BATCH_LOOKUP_ID_COL,
        createdAtCol: AppConfig.DB_BATCH_LOOKUP_CREATED_AT_COL,
        updatedAtCol: AppConfig.DB_BATCH_LOOKUP_UPDATED_AT_COL,
        updatedByCol: AppConfig.DB_BATCH_LOOKUP_UPDATED_BY_COL,
        notesByCol: AppConfig.DB_BATCH_LOOKUP_NOTES_BY_COL,
        fotoUrlByCol: AppConfig.DB_BATCH_LOOKUP_FOTO_URL_BY_COL,
        infoUrlByCol: AppConfig.DB_BATCH_LOOKUP_INFO_URL_BY_COL,
        perBucketByCol: AppConfig.DB_BATCH_LOOKUP_PER_BUCKET_BY_COL
      }
      // Nanti tambah domain baru di sini juga ya, contoh PRODUCT:
      // contoh nambahin domain baru (misal PRODUCT):
      // // 2. TINGGAL TAMBAHIN PRODUCT DI SINI
      // [AppConfig.DB_PRODUCT_SHEET_NAME]: {
      //   startRow: AppConfig.DB_PRODUCT_START_ROW,
      //   idCol: AppConfig.DB_PRODUCT_ID_COL,
      //   updatedAtCol: AppConfig.DB_PRODUCT_UPDATED_AT_COL,
      //   // Kalau product gak butuh updatedBy, biarin aja gak usah ditulis!
      // }      
    };

    const config = tableWatchers[sheetName];
    if (!config) return; 

    if (row < config.startRow) return;
    
    // 1. Handle Auto UUID
    if (config.idCol) {
      const idCell = sheet.getRange(row, config.idCol);
      if (!idCell.getValue() || idCell.getValue() === '') {
        idCell.setValue(AppUtils.generateUUID());
      }
    }

    // 2. Handle Audit Trail
    const audit = AppUtils.getAuditTrail();
    
    if (config.updatedAtCol) {
      sheet.getRange(row, config.updatedAtCol).setValue(audit.updatedAt);
    }
    
    if (config.updatedByCol) {
      sheet.getRange(row, config.updatedByCol).setValue(audit.updatedBy);
    }

    // ====================================================
    // 3. GLOBAL CACHE VERSIONING (BARU DITAMBAHKAN)
    // Update timestamp versi untuk sheet ini setiap ada edit
    // ====================================================
    const props = PropertiesService.getScriptProperties();
    const versionKey = `VERSION_${sheetName}`;
    props.setProperty(versionKey, Date.now().toString());
    
  } catch (error) {
    console.error("Trigger Router Error: " + error.toString());
  }
}

/**
 * INSTALLER: Jalankan fungsi ini manual di Apps Script Editor
 * untuk mendaftarkan listener ke Spreadsheet Lookup.
 */
function setupLayananTrigger() {
  const targetSpreadsheetIds = [
    AppConfig.DB_CUSTOMER_LOOKUP_ID,
    AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_ID,
    AppConfig.DB_SHIPPING_LABEL_ID,
    AppConfig.DB_BATCH_LOOKUP_ID
  ];

  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(t => {
    if (t.getHandlerFunction() === 'onEdit') {
      ScriptApp.deleteTrigger(t);
    }
  });

  targetSpreadsheetIds.forEach(ssId => {
    try {
      const ss = SpreadsheetApp.openById(ssId);
      ScriptApp.newTrigger('onEdit')
        .forSpreadsheet(ss)
        .onEdit()
        .create();
      Logger.log("Berhasil: CCTV dipasang di Spreadsheet => " + ss.getName());
    } catch (error) {
      Logger.log("Gagal memasang CCTV di ID: " + ssId + " | Error: " + error.toString());
    }
  });
}