// source/_module/workspace/SpreadsheetApp/SheetStyler.js
const SheetStyler = (function() {
  return {
    /**
     * Membekukan baris (freeze rows)
     */
    freezeRows: function(spreadsheetId, sheetName, numRows) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      sheet.setFrozenRows(numRows);
    },

    /**
     * Membekukan kolom (freeze columns)
     */
    freezeColumns: function(spreadsheetId, sheetName, numCols) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      sheet.setFrozenColumns(numCols);
    },

    /**
     * Menerapkan gaya tebal pada range
     */
    setBold: function(spreadsheetId, sheetName, row, col, numRows, numCols, isBold = true) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const range = sheet.getRange(row, col, numRows, numCols);
      range.setFontWeight(isBold ? "bold" : "normal");
    },

    /**
     * Mengatur warna latar belakang range
     * @param {string} color - kode hex atau nama warna
     */
    setBackground: function(spreadsheetId, sheetName, row, col, numRows, numCols, color) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const range = sheet.getRange(row, col, numRows, numCols);
      range.setBackground(color);
    },

    /**
     * Mengatur format angka (misal "#,##0" untuk ribuan)
     */
    setNumberFormat: function(spreadsheetId, sheetName, row, col, numRows, numCols, format) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      const range = sheet.getRange(row, col, numRows, numCols);
      range.setNumberFormat(format);
    },

    /**
     * Auto resize kolom berdasarkan konten
     */
    autoResizeColumns: function(spreadsheetId, sheetName, startColumn, numColumns) {
      const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
      sheet.autoResizeColumns(startColumn, numColumns);
    }
  };
})();