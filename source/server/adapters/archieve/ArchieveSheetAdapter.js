// source/server/adapters/archieve/ArchieveSheetAdapter.js

/**
 * Adapter for ARCHIEVE sheet – handles CRUD with custom header row.
 * @constructor
 */
function ArchieveSheetAdapter() {
  const config = ApplicationConfig.dataSources.driveArchieve;
  const sheetConfig = config.configs.find(c => c.type === 'ARCHIEVE');
  if (!sheetConfig) throw new Error('ARCHIEVE sheet config not found in AppConfig');

  const spreadsheetId = config.spreadsheetId;
  const sheetName = config.sheetName;
  const startRow = config.startRow;     // 6
  const headerRow = config.headerRow;   // 5
  const fieldMapping = sheetConfig.fieldMapping; // { standardField: "HEADER NAME" }

  // Build reverse mapping: "HEADER NAME" → standardField
  const reverseMapping = {};
  for (const stdField in fieldMapping) {
    reverseMapping[fieldMapping[stdField]] = stdField;
  }

  /** @returns {string[]} ordered header names from headerRow */
  function getHeaderOrder() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastCol = sheet.getLastColumn();
    const rawHeaders = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
    return rawHeaders.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(Boolean);
  }

  /**
   * Convert standard object → raw object (key = header name).
   * @param {Object} stdObj
   * @returns {Object}
   */
  function toRawObject(stdObj) {
    const raw = {};
    for (const [stdField, headerName] of Object.entries(fieldMapping)) {
      if (stdObj[stdField] !== undefined) raw[headerName] = stdObj[stdField];
    }
    return raw;
  }

  /**
   * Convert raw object (header keys) → standard object.
   * @param {Object} rawObj
   * @returns {Object}
   */
  function toStandardObject(rawObj) {
    const std = {};
    for (const header in rawObj) {
      const stdField = reverseMapping[header];
      if (stdField) std[stdField] = rawObj[header];
    }
    return std;
  }

  /**
   * Read all rows from sheet and return array of { rowNumber, raw, std }.
   * @returns {Array<{rowNumber:number, raw:Object, std:Object}>}
   */
  function readAllRows() {
    const sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return [];

    const headerOrder = getHeaderOrder();
    const numRows = lastRow - startRow + 1;
    const lastCol = sheet.getLastColumn();
    const dataRange = sheet.getRange(startRow, 1, numRows, lastCol);
    const values = dataRange.getValues();

    const rows = [];
    for (let i = 0; i < values.length; i++) {
      const rawObj = {};
      headerOrder.forEach((header, idx) => {
        let val = values[i][idx];
        if (typeof val === 'string') val = val.trim();
        rawObj[header] = (val !== undefined && val !== '') ? val : null;
      });
      rows.push({
        rowNumber: startRow + i,
        raw: rawObj,
        std: toStandardObject(rawObj)
      });
    }
    return rows;
  }

  // —— PUBLIC API ——

  /** @returns {Array<Object>} */
  this.getAll = function() {
    return readAllRows().map(r => r.std);
  };

  /**
   * @param {string} id
   * @returns {Object|null}
   */
  this.findById = function(id) {
    const rows = readAllRows();
    const found = rows.find(r => r.std.id === id);
    return found ? found.std : null;
  };

  /**
   * Find records by standard field name.
   * @param {string} standardField - e.g. 'entityId'
   * @param {string} value
   * @returns {Array<Object>}
   */
  this.findByField = function(standardField, value) {
    const rows = readAllRows();
    const target = String(value).trim().toLowerCase();
    return rows
      .filter(r => {
        const val = r.std[standardField];
        return val !== null && val !== undefined && String(val).trim().toLowerCase() === target;
      })
      .map(r => r.std);
  };

  /**
   * Append a new row using headerRow-aware writer.
   * @param {Object} stdObj - standard field object
   */
  this.append = function(stdObj) {
    const raw = toRawObject(stdObj);
    SheetWriter.appendRowWithHeaderAtRow(spreadsheetId, sheetName, raw, headerRow);
  };

  /**
   * Update an existing row by ID.
   * @param {string} id
   * @param {Object} stdObj - new standard field object
   */
  this.updateById = function(id, stdObj) {
    const rows = readAllRows();
    const found = rows.find(r => r.std.id === id);
    if (!found) throw new Error(`Archive record with ID ${id} not found`);

    const raw = toRawObject(stdObj);
    SheetWriter.updateRowWithHeaderAtRow(
      spreadsheetId, sheetName, found.rowNumber, raw, headerRow
    );
  };

  /**
   * Soft-delete: set STATUES = 'DELETED'.
   * @param {string} id
   */
  this.deleteById = function(id) {
    const existing = this.findById(id);
    if (!existing) throw new Error('Archive record not found');
    existing.statues = 'DELETED';
    this.updateById(id, existing);
  };
}