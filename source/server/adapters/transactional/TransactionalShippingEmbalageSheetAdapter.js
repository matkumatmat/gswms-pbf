// source/server/adapters/transactional/TransactionalShippingEmbalageSheetAdapter.js

function TransactionalShippingEmbalageSheetAdapter(yearConfig, sheetConfig) {
  const sheetReader = SheetReader;
  const spreadsheetId = yearConfig.spreadsheetId;
  const sheetName = sheetConfig.sheetName;
  const startRow = sheetConfig.startRow;
  const headerRow = sheetConfig.headerRow || startRow - 1;
  const globalCells = sheetConfig.globalUpdatedAtCell ? {
    updatedAt: sheetConfig.globalUpdatedAtCell,
    lastSync: sheetConfig.globalLastSyncAtCell,
    updatedBy: sheetConfig.globalUpdatedByCell
  } : null;

  const cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearConfig.spreadsheetId,
    sheetName: sheetConfig.sheetName,
    year: yearConfig.year,
    type: sheetConfig.type
  });

  let cache = null;

  function buildCache() {
    if (cache) {
      const currentVersion = CacheManager.getVersion(cacheGroup);
      if (cache.version === currentVersion) return cache;
    }

    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) {
      cache = {
        mapIdToRow: new Map(),
        mapIdToRowNumber: new Map(),
        headers: [],
        headerOrder: [],
        version: CacheManager.getVersion(cacheGroup)
      };
      return cache;
    }

    const headerValues = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
    const idIndex = headers.findIndex(h => h && h.toUpperCase() === 'ID');
    if (idIndex === -1) throw new Error('ID column not found in header row ' + headerRow);

    const numCols = sheet.getLastColumn();
    const dataRange = sheet.getRange(startRow, 1, lastRow - startRow + 1, numCols);
    const rows = dataRange.getValues();

    const mapIdToRow = new Map();
    const mapIdToRowNumber = new Map();

    rows.forEach((row, idx) => {
      const obj = {};
      headers.forEach((header, colIdx) => {
        let val = row[colIdx];
        if (typeof val === 'string') val = val.trim();
        obj[header] = (val !== undefined && val !== '') ? val : null;
      });
      const idValue = obj.ID || obj.id;
      if (idValue) {
        const idStr = String(idValue).trim();
        mapIdToRow.set(idStr, obj);
        mapIdToRowNumber.set(idStr, startRow + idx);
      }
    });

    cache = {
      mapIdToRow,
      mapIdToRowNumber,
      headers,
      headerOrder: headers,
      version: CacheManager.getVersion(cacheGroup)
    };
    return cache;
  }

  function invalidateCache() {
    cache = null;
  }

  this.getPaginated = function(page, limit) {
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return { data: [], total: 0 };
    const total = lastRow - startRow + 1;
    const offset = (page - 1) * limit;
    const startDataRow = startRow + offset;
    const rowsToFetch = Math.min(limit, total - offset);
    if (rowsToFetch <= 0) return { data: [], total: total };

    const headerValues = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
    const numCols = sheet.getLastColumn();
    const dataRange = sheet.getRange(startDataRow, 1, rowsToFetch, numCols);
    const rows = dataRange.getValues();

    const data = rows.map(row => {
      const obj = {};
      headers.forEach((header, idx) => {
        let val = row[idx];
        if (typeof val === 'string') val = val.trim();
        obj[header] = (val !== undefined && val !== '') ? val : null;
      });
      return obj;
    });
    return { data: data, total: total };
  };

  this.findById = function(id) {
    const cacheData = buildCache();
    return cacheData.mapIdToRow.get(String(id).trim()) || null;
  };

  this.findByField = function(fieldName, value) {
    const cacheData = buildCache();
    const searchValue = String(value).trim().toLowerCase();
    const results = [];
    for (let row of cacheData.mapIdToRow.values()) {
      const cell = row[fieldName];
      if (cell && String(cell).trim().toLowerCase() === searchValue) {
        results.push(row);
      }
    }
    return results;
  };

  this.append = function(dataObj) {
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    let headerOrder = cache ? cache.headerOrder : null;
    if (!headerOrder) {
      const headerValues = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
      headerOrder = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
    }
    if (headerOrder.length === 0) throw new Error(`No valid headers at row ${headerRow}`);
    const rowArray = headerOrder.map(header => {
      let val = dataObj[header];
      if (val === undefined) val = '';
      if (val instanceof Date) val = val.toISOString();
      return val;
    });
    sheet.appendRow(rowArray);
    invalidateCache();
    // this._updateGlobalCells();
  };

  this.updateById = function(id, dataObj) {
    const cacheData = buildCache();
    const rowNumber = cacheData.mapIdToRowNumber.get(String(id).trim());
    if (!rowNumber) throw new Error(`Record with ID ${id} not found`);
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    let headerOrder = cacheData.headerOrder;
    if (!headerOrder) {
      const headerValues = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
      headerOrder = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(h => h !== null);
    }
    const rowArray = headerOrder.map(header => {
      let val = dataObj[header];
      if (val === undefined) val = '';
      if (val instanceof Date) val = val.toISOString();
      return val;
    });
    sheet.getRange(rowNumber, 1, 1, rowArray.length).setValues([rowArray]);
    invalidateCache();
    // this._updateGlobalCells();
  };

  this.deleteById = function(id) {
    const existing = this.findById(id);
    if (!existing) throw new Error('Record not found');
    existing.STATUES = 'DELETED';
    this.updateById(id, existing);
  };

  // this._updateGlobalCells = function() {
  //   if (!globalCells) return;
  //   const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
  //   const audit = AuditUtils.getAuditTrail();
  //   if (globalCells.updatedAt) sheet.getRange(globalCells.updatedAt).setValue(audit.updatedAt);
  //   if (globalCells.lastSync) sheet.getRange(globalCells.lastSync).setValue(audit.updatedAt);
  //   if (globalCells.updatedBy) sheet.getRange(globalCells.updatedBy).setValue(audit.updatedBy);
  // };
    this.updateGlobalCells = function(userEmail) {
    if (!globalCells) return;
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    const audit = AuditUtils.getAuditTrail(userEmail);
    if (globalCells.updatedAt) sheet.getRange(globalCells.updatedAt).setValue(audit.updatedAt);
    if (globalCells.lastSync) sheet.getRange(globalCells.lastSync).setValue(audit.updatedAt);
    if (globalCells.updatedBy) sheet.getRange(globalCells.updatedBy).setValue(audit.updatedBy);
  };  
}