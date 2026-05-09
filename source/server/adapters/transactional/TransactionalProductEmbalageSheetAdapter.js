// source/server/adapters/transactional/TransactionalProductEmbalageSheetAdapter.js

function TransactionalProductEmbalageSheetAdapter(yearConfig, sheetConfig) {
  const sheetReader   = SheetReader;
  const spreadsheetId = yearConfig.spreadsheetId;
  const sheetName     = sheetConfig.sheetName;
  const startRow      = sheetConfig.startRow;
  const headerRow     = sheetConfig.headerRow || startRow - 1;
  const globalCells   = sheetConfig.globalUpdatedAtCell ? {
    updatedAt: sheetConfig.globalUpdatedAtCell,
    lastSync:  sheetConfig.globalLastSyncAtCell,
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

  function _buildCache() {
    if (cache) {
      const currentVersion = CacheManager.getVersion(cacheGroup);
      if (cache.version === currentVersion) return cache;
    }

    const sheet   = sheetReader.openSheet(spreadsheetId, sheetName);
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
    const headers      = headerValues
      .map(h => (h && typeof h === 'string') ? h.trim() : null)
      .filter(Boolean);

    const idIndex = headers.findIndex(h => h.toUpperCase() === 'ID');
    if (idIndex === -1) throw new Error('ID column not found in header row ' + headerRow);

    const numCols  = sheet.getLastColumn();
    const dataVals = sheet.getRange(startRow, 1, lastRow - startRow + 1, numCols).getValues();

    const mapIdToRow       = new Map();
    const mapIdToRowNumber = new Map();

    dataVals.forEach((row, idx) => {
      const obj = {};
      headers.forEach((header, colIdx) => {
        let val = row[colIdx];
        if (typeof val === 'string') val = val.trim();
        obj[header] = (val !== undefined && val !== '') ? val : null;
      });

      const idRaw = obj.ID || obj.id;
      if (idRaw) {
        const idStr = String(idRaw).trim();
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

  function _invalidateCache() {
    cache = null;
  }

  function _updateGlobalCells() {
    if (!globalCells) return;
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    const audit = AuditUtils.getAuditTrail();
    if (globalCells.updatedAt) sheet.getRange(globalCells.updatedAt).setValue(audit.updatedAt);
    if (globalCells.lastSync)  sheet.getRange(globalCells.lastSync).setValue(audit.updatedAt);
    if (globalCells.updatedBy) sheet.getRange(globalCells.updatedBy).setValue(audit.updatedBy);
  }

  // ─── PUBLIC API ───────────────────
  this.getPaginated = function(page, limit) {
    const sheet   = sheetReader.openSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return { data: [], total: 0 };
    const total = lastRow - startRow + 1;
    const offset = (page - 1) * limit;
    const startDataRow = startRow + offset;
    const rowsToFetch = Math.min(limit, total - offset);
    if (rowsToFetch <= 0) return { data: [], total };

    const headerValues = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(Boolean);
    const dataVals = sheet.getRange(startDataRow, 1, rowsToFetch, sheet.getLastColumn()).getValues();
    const data = dataVals.map(row => {
      const obj = {};
      headers.forEach((header, idx) => {
        let val = row[idx];
        if (typeof val === 'string') val = val.trim();
        obj[header] = (val !== undefined && val !== '') ? val : null;
      });
      return obj;
    });
    return { data, total };
  };

  this.findById = function(id) {
    return _buildCache().mapIdToRow.get(String(id).trim()) || null;
  };

  this.findByField = function(headerName, value) {
    const cacheData   = _buildCache();
    const searchValue = String(value).trim().toLowerCase();
    const results = [];
    for (const row of cacheData.mapIdToRow.values()) {
      const cell = row[headerName];
      if (cell !== null && cell !== undefined && String(cell).trim().toLowerCase() === searchValue) {
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
      headerOrder = headerValues.map(h => (h && typeof h === 'string') ? h.trim() : null).filter(Boolean);
    }
    if (!headerOrder.length) throw new Error('No valid headers at row ' + headerRow);
    const rowArray = headerOrder.map(header => {
      let val = dataObj[header];
      if (val === undefined) val = '';
      if (val instanceof Date) val = val.toISOString();
      return val;
    });
    sheet.appendRow(rowArray);
    _invalidateCache();
    _updateGlobalCells();
  };

  this.updateById = function(id, dataObj) {
    const cacheData = _buildCache();
    const rowNumber = cacheData.mapIdToRowNumber.get(String(id).trim());
    if (!rowNumber) throw new Error('Record with ID ' + id + ' not found');
    const sheet = sheetReader.openSheet(spreadsheetId, sheetName);
    const headerOrder = cacheData.headerOrder;
    const rowArray = headerOrder.map(header => {
      let val = dataObj[header];
      if (val === undefined) val = '';
      if (val instanceof Date) val = val.toISOString();
      return val;
    });
    sheet.getRange(rowNumber, 1, 1, rowArray.length).setValues([rowArray]);
    _invalidateCache();
    _updateGlobalCells();
  };

  this.deleteById = function(id) {
    const existing = this.findById(id);
    if (!existing) throw new Error('Record with ID ' + id + ' not found');
    existing.STATUES = 'DELETED';
    this.updateById(id, existing);
  };
}