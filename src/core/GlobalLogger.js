// src/core/GlobalLogger.js

class GlobalLogger {
  static log(user, action, entity, entityId = '-', valBefore = '-', valAfter = '-') {
    try {
      const config = AppConfig.DB_LOGGING;
      const ss = SpreadsheetApp.openById(config.DB_LOGGING_ID);
      const sheet = ss.getSheetByName(config.DB_LOGGING_SHEET_NAME);
      
      const row = [];
      row[config.COLS.ID_COL - 1] = AppUtils.generateUUID();
      row[config.COLS.TIMESTAMP_COL - 1] = new Date();
      row[config.COLS.USER_COL - 1] = user;
      row[config.COLS.ACTION_COL - 1] = action.toUpperCase();
      row[config.COLS.DETAILS_COL - 1] = `[${entity}] ID: ${entityId}`;
      row[config.COLS.VAL_BEFORE_COL - 1] = typeof valBefore === 'object' ? JSON.stringify(valBefore) : valBefore;
      row[config.COLS.VAL_AFTER_COL - 1] = typeof valAfter === 'object' ? JSON.stringify(valAfter) : valAfter;

      sheet.appendRow(row);
    } catch (e) { console.error("Logger Error: " + e.message); }
  }
}