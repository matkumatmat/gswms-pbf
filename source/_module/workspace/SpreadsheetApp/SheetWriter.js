// source/_module/workspace/SpreadsheetApp/SheetWriter.js
const SheetWriter = (function() {
  /**
   * Private: Mendapatkan urutan header (nama kolom) untuk menulis baris secara konsisten
   */
  function _getHeaderOrder(sheet) {
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    return headers.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
  }

  return {
    /**
     * Menambahkan baris baru di akhir sheet berdasarkan object dengan key = header
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {Object} dataObj - key = nama kolom, value = nilai
     */
    appendRow: function(spreadsheetId, sheetName, dataObj) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const headerOrder = _getHeaderOrder(sheet);
      if (headerOrder.length === 0) {
        throw new Error(`Sheet ${sheetName} tidak memiliki header yang valid.`);
      }
      const rowData = headerOrder.map(header => {
        let val = dataObj[header];
        if (val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString();
        return val;
      });
      sheet.appendRow(rowData);
    },

    /**
     * Update nilai cell berdasarkan baris dan kolom (kolom menggunakan indeks 1-based)
     */
    updateCell: function(spreadsheetId, sheetName, row, column, value) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      sheet.getRange(row, column).setValue(value);
    },

    /**
     * Update seluruh baris berdasarkan urutan header yang ada.
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {number} rowNumber (1-indexed)
     * @param {Object} dataObj - key = header, value = nilai baru
     */
    updateRow: function(spreadsheetId, sheetName, rowNumber, dataObj) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const headerOrder = _getHeaderOrder(sheet);
      const rowData = headerOrder.map(header => {
        let val = dataObj[header];
        if (val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString();
        return val;
      });
      sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
    },

    /**
     * Clear konten di range tertentu
     */
    clearRange: function(spreadsheetId, sheetName, row, col, numRows, numCols) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      sheet.getRange(row, col, numRows, numCols).clearContent();
    },

    /**
     * Menambahkan baris baru berdasarkan header yang terletak di baris tertentu (bukan baris 1).
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {Object} dataObj - key = header, value = nilai
     * @param {number} headerRow - nomor baris tempat header berada (1-indexed)
     */
    appendRowWithHeaderAtRow: function(spreadsheetId, sheetName, dataObj, headerRow) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const lastCol = sheet.getLastColumn();
      const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
      const headerOrder = headers.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
      if (headerOrder.length === 0) {
        throw new Error(`Sheet ${sheetName} tidak memiliki header yang valid di baris ${headerRow}.`);
      }
      const rowData = headerOrder.map(header => {
        let val = dataObj[header];
        if (val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString();
        return val;
      });
      sheet.appendRow(rowData);
    },

    /**
     * Update baris berdasarkan header di baris tertentu.
     */
    updateRowWithHeaderAtRow: function(spreadsheetId, sheetName, rowNumber, dataObj, headerRow) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const lastCol = sheet.getLastColumn();
      const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
      const headerOrder = headers.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
      const rowData = headerOrder.map(header => {
        let val = dataObj[header];
        if (val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString();
        return val;
      });
      sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
    }
  };
})();