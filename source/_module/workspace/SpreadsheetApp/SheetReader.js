// source/_module/workspace/SpreadsheetApp/SheetReader.js
const SheetReader = (function() {
  /**
   * Private: Mendapatkan mapping header (nama kolom -> indeks 1-based)
   */
  function _getHeaderMap(sheet) {
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return new Map();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const map = new Map();
    headers.forEach((h, idx) => {
      if (h && typeof h === 'string') {
        map.set(h.trim(), idx + 1);
      }
    });
    return map;
  }

  return {
    /**
     * Membuka sheet berdasarkan spreadsheetId dan sheetName
     * @throws jika sheet tidak ditemukan
     */
    openSheet: function(spreadsheetId, sheetName) {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" tidak ditemukan di spreadsheet ${spreadsheetId}`);
      }
      return sheet;
    },

    /**
     * Membaca semua data dari sheet mulai baris startRow (default 2)
     * @returns {Array<Object>} - Array of objects dengan key = nama kolom (header)
     */
    getAllRows: function(spreadsheetId, sheetName, startRow = 2) {
      const sheet = this.openSheet(spreadsheetId, sheetName);
      const headerMap = _getHeaderMap(sheet);
      const headers = Array.from(headerMap.keys());
      const lastRow = sheet.getLastRow();
      if (lastRow < startRow) return [];

      const numCols = sheet.getLastColumn();
      const range = sheet.getRange(startRow, 1, lastRow - startRow + 1, numCols);
      const rows = range.getValues();

      return rows.map(row => {
        const obj = {};
        headers.forEach(header => {
          const colIdx = headerMap.get(header) - 1;
          let val = row[colIdx];
          if (typeof val === 'string') val = val.trim();
          obj[header] = (val !== undefined && val !== '') ? val : null;
        });
        return obj;
      });
    },

    /**
     * Membaca satu baris berdasarkan nomor baris (1-indexed)
     */
    readRow: function(spreadsheetId, sheetName, rowNumber) {
      const sheet = this.openSheet(spreadsheetId, sheetName);
      const headerMap = _getHeaderMap(sheet);
      const headers = Array.from(headerMap.keys());
      const numCols = sheet.getLastColumn();
      const rowValues = sheet.getRange(rowNumber, 1, 1, numCols).getValues()[0];
      const obj = {};
      headers.forEach(header => {
        const colIdx = headerMap.get(header) - 1;
        let val = rowValues[colIdx];
        if (typeof val === 'string') val = val.trim();
        obj[header] = (val !== undefined && val !== '') ? val : null;
      });
      return obj;
    }
  };
})();