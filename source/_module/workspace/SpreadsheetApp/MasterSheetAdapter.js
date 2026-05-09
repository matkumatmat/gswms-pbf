// source/_module/workspace/SpreadsheetApp/MasterSheetAdapter.js

/**
 * Generic adapter untuk sheet master dengan header row yang dapat dikonfigurasi.
 * Melakukan mapping antara standard field (camelCase) dan header sheet (UPPER CASE).
 *
 * @param {Object} config
 * @param {string} config.spreadsheetId
 * @param {string} config.sheetName
 * @param {number} config.headerRow - nomor baris header (1‑based)
 * @param {number} config.startRow  - nomor baris data pertama (1‑based)
 * @param {Object} config.fieldMapping - { standardField: "HEADER NAME" }
 * @param {Object} [config.globalCells] - { updatedAt: "CELL", lastSync: "CELL", updatedBy: "CELL" }
 */
function MasterSheetAdapter(config) {
  const { spreadsheetId, sheetName, headerRow, startRow, fieldMapping, globalCells } = config;

  // Reverse mapping: nama header → standard field
  const reverseMapping = {};
  for (const stdField in fieldMapping) {
    reverseMapping[fieldMapping[stdField]] = stdField;
  }

  /** Ambil urutan header dari baris headerRow */
  function getHeaderOrder() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastCol = sheet.getLastColumn();
    const rawHeaders = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
    return rawHeaders.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(Boolean);
  }

  /** Konversi objek standard → objek dengan key = header sheet */
  function toRaw(stdObj) {
    const raw = {};
    for (const [stdField, header] of Object.entries(fieldMapping)) {
      if (stdObj[stdField] !== undefined) raw[header] = stdObj[stdField];
    }
    return raw;
  }

  /** Konversi objek row sheet → standard object */
  function toStandard(rawObj) {
    const std = {};
    for (const header in rawObj) {
      const stdField = reverseMapping[header];
      if (stdField) std[stdField] = rawObj[header];
    }
    return std;
  }

  /** Baca seluruh data, kembalikan array objek dengan properti rowNumber dan standard object */
  function readAllRows() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return [];

    const headerOrder = getHeaderOrder();
    const numCols = sheet.getLastColumn();
    const numRows = lastRow - startRow + 1;
    const values = sheet.getRange(startRow, 1, numRows, numCols).getValues();

    const rows = [];
    for (let i = 0; i < values.length; i++) {
      const raw = {};
      headerOrder.forEach((header, idx) => {
        let val = values[i][idx];
        if (typeof val === 'string') val = val.trim();
        raw[header] = (val !== undefined && val !== '') ? val : null;
      });
      rows.push({
        rowNumber: startRow + i,
        raw: raw,
        std: toStandard(raw)
      });
    }
    return rows;
  }

  // ─── PUBLIC API ──────────────────────────────────────────

  /** Mendapatkan semua record sebagai array standard object */
  this.getAll = function () {
    return readAllRows().map(r => r.std);
  };

  /** Cari berdasarkan ID */
  this.findById = function (id) {
    const rows = readAllRows();
    const found = rows.find(r => r.std.id === id);
    return found ? found.std : null;
  };

  /** Cari berdasarkan standard field (exact match, case‑insensitive) */
  this.findByField = function (standardField, value) {
    const rows = readAllRows();
    const target = String(value).trim().toLowerCase();
    return rows
      .filter(r => {
        const val = r.std[standardField];
        return val !== null && val !== undefined && String(val).trim().toLowerCase() === target;
      })
      .map(r => r.std);
  };

  /** Tambah baris baru (menggunakan headerRow) */
  this.append = function (stdObj) {
    const raw = toRaw(stdObj);
    SheetWriter.appendRowWithHeaderAtRow(spreadsheetId, sheetName, raw, headerRow);
  };

  /** Update baris berdasarkan ID (inline, untuk soft‑delete) */
  this.updateById = function (id, stdObj) {
    const rows = readAllRows();
    const found = rows.find(r => r.std.id === id);
    if (!found) throw new Error(`Record with ID ${id} not found`);

    const raw = toRaw(stdObj);
    SheetWriter.updateRowWithHeaderAtRow(
      spreadsheetId, sheetName, found.rowNumber, raw, headerRow
    );
  };

  /** Update global metadata cells */
  this.updateGlobalCells = function () {
    if (!globalCells) return;
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const audit = AuditUtils.getAuditTrail();
    if (globalCells.updatedAt) sheet.getRange(globalCells.updatedAt).setValue(audit.updatedAt);
    if (globalCells.lastSync)  sheet.getRange(globalCells.lastSync).setValue(audit.updatedAt);
    if (globalCells.updatedBy) sheet.getRange(globalCells.updatedBy).setValue(audit.updatedBy);
  };
}