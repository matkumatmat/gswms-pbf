/**
 * Adapter untuk sheet OLAP_BATCH_DAILY.
 * Bertanggung jawab membaca seluruh data dan menimpa isi sheet (overwrite).
 * Tidak mengelola audit trail per baris karena data seluruhnya dihasilkan oleh pipeline.
 *
 * @param {Object} config - Konfigurasi sheet dari AppConfig.dataSources.olap.configs
 * @property {string} spreadsheetId
 * @property {string} sheetName
 * @property {number} headerRow       - Nomor baris header
 * @property {number} startRow        - Nomor baris data pertama
 * @property {Object} fieldMapping    - Mapping standardField → header name
 * @property {Object} [globalCells]   - Cell untuk lastSync, updatedAt, updatedBy
 */
function OlapBatchDailyAdapter(config) {
  const spreadsheetId = config.spreadsheetId;
  const sheetName = config.sheetName;
  const headerRow = config.headerRow;
  const startRow = config.startRow;
  const fieldMapping = config.fieldMapping;
  const globalCells = config.globalCells || null;

  // Reverse mapping: header name → standardField
  const reverseMapping = {};
  for (const stdField in fieldMapping) {
    reverseMapping[fieldMapping[stdField]] = stdField;
  }

  /**
   * Ambil urutan header dari baris headerRow.
   * @returns {string[]} Nama-nama header yang valid
   */
  function getHeaderOrder() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastCol = sheet.getLastColumn();
    const rawHeaders = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
    return rawHeaders.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(Boolean);
  }

  /**
   * Konversi objek standar (standard field) menjadi objek mentah untuk ditulis (header name keys).
   * @param {Object} stdObj 
   * @returns {Object}
   */
  function toRaw(stdObj) {
    const raw = {};
    for (const [stdField, header] of Object.entries(fieldMapping)) {
      raw[header] = (stdObj[stdField] !== undefined) ? stdObj[stdField] : null;
    }
    return raw;
  }

  /**
   * Konversi objek sheet (header names) ke standard field.
   * @param {Object} rawObj 
   * @returns {Object}
   */
  function toStandard(rawObj) {
    const std = {};
    for (const header in rawObj) {
      const stdField = reverseMapping[header];
      if (stdField) std[stdField] = rawObj[header];
    }
    return std;
  }

  // ─────── PUBLIC API ─────────

  /**
   * Membaca SEMUA data yang ada di sheet dan mengembalikan array standard object.
   * @returns {Object[]}
   */
  this.getAll = function() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return [];

    const headerOrder = getHeaderOrder();
    const numRows = lastRow - startRow + 1;
    const lastCol = sheet.getLastColumn();
    const values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

    return values.map(row => {
      const raw = {};
      headerOrder.forEach((header, idx) => {
        let val = row[idx];
        if (typeof val === 'string') val = val.trim();
        raw[header] = (val !== undefined && val !== '') ? val : null;
      });
      return toStandard(raw);
    });
  };

  /**
   * Menimpa seluruh data sheet dengan array standard object yang diberikan.
   * Menghapus semua baris dari startRow ke bawah, lalu menulis ulang.
   * @param {Object[]} stdArray - Array objek dengan properti sesuai fieldMapping
   */
  this.overwriteAll = function(stdArray) {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const headerOrder = getHeaderOrder();
    const lastCol = headerOrder.length;

    // 1. Hapus semua data lama
    const lastRow = sheet.getLastRow();
    if (lastRow >= startRow) {
      sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol).clearContent();
    }

    // 2. Tulis baris baru (efisien, langsung setValues jika data banyak)
    if (stdArray.length === 0) return;

    const rawRows = stdArray.map(stdObj => {
      const raw = toRaw(stdObj);
      return headerOrder.map(header => {
        let val = raw[header];
        if (val === undefined || val === null) val = '';
        if (val instanceof Date) val = val.toISOString();
        return val;
      });
    });

    sheet.getRange(startRow, 1, rawRows.length, lastCol).setValues(rawRows);
  };

  /**
   * Update sel global metadata (lastSync, updatedAt, updatedBy) setelah rebuild.
   * @param {Date} now - Waktu rebuild
   * @param {string} user - "SYSTEM" atau email trigger
   */
  this.updateGlobalCells = function(now, user) {
    if (!globalCells) return;
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    if (globalCells.lastSync)  sheet.getRange(globalCells.lastSync).setValue(now);
    if (globalCells.updatedAt) sheet.getRange(globalCells.updatedAt).setValue(now);
    if (globalCells.updatedBy) sheet.getRange(globalCells.updatedBy).setValue(user || 'SYSTEM');
  };
}