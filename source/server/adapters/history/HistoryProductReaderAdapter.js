// source/server/adapters/history/ProductHistoryReaderAdapter.js

function ProductHistoryReaderAdapter() {
  var RELEVANT_SHEET_TYPES = ['ALL_DIST', 'ALL_RCV', 'ALL_CONS'];
  var MAX_RECORDS_PER_CHUNK = 100; // Perkiraan aman untuk batas 100KB

  // Ambil data dari sheet (tanpa cache dulu), kemudian simpan chunked cache
  function _fetchAndCacheSheet(year, sheetType) {
    var start = new Date();
    var service;
    try {
      service = TransactionalFactory.getService(year, sheetType);
    } catch(e) {
      Logger.log("  [" + year + "/" + sheetType + "] ERROR: cannot get service - " + e.message);
      return [];
    }
    var records;
    try {
      records = service.getAll();
    } catch(e) {
      Logger.log("  [" + year + "/" + sheetType + "] ERROR: " + e.message);
      return [];
    }
    var elapsed = (new Date() - start) / 1000;
    Logger.log("  [" + year + "/" + sheetType + "] fetched " + records.length + " records in " + elapsed.toFixed(2) + "s");
    
    // Konversi ke format yang akan disimpan (bisa dipersempit field jika perlu, tapi biarkan sesuai asli)
    var result = records.map(function(record) {
      return { year: year, sheetType: sheetType, record: record };
    });
    
    // Simpan ke cache dengan chunking
    var cacheGroup = 'TRANS_' + year + '_' + sheetType;
    var version = CacheRegistry.getVersion(cacheGroup);
    var ttl = CacheRegistry.getTTL(cacheGroup);
    
    // Hapus chunk lama (jika ada)
    for (var i = 0; ; i++) {
      var oldKey = 'PROD_HIST_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      var oldVal = CacheWrapper.get(oldKey);
      if (oldVal === null) break;
      CacheWrapper.remove(oldKey);
    }
    
    // Simpan chunk baru
    var totalChunks = Math.ceil(result.length / MAX_RECORDS_PER_CHUNK);
    for (var i = 0; i < totalChunks; i++) {
      var chunk = result.slice(i * MAX_RECORDS_PER_CHUNK, (i + 1) * MAX_RECORDS_PER_CHUNK);
      var chunkKey = 'PROD_HIST_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      CacheWrapper.put(chunkKey, chunk, ttl);
    }
    // Simpan metadata jumlah chunk
    var metaKey = 'PROD_HIST_CHUNK_META_' + cacheGroup + '_V' + version;
    CacheWrapper.put(metaKey, { totalChunks: totalChunks, count: result.length }, ttl);
    
    return result;
  }
  
  // Ambil data dari cache (dengan menggabungkan chunk) atau fetch & cache jika tidak ada
  function _fetchAllFromSheet(year, sheetType) {
    var cacheGroup = 'TRANS_' + year + '_' + sheetType;
    var version = CacheRegistry.getVersion(cacheGroup);
    var metaKey = 'PROD_HIST_CHUNK_META_' + cacheGroup + '_V' + version;
    var meta = CacheWrapper.get(metaKey);
    
    if (meta && meta.totalChunks > 0) {
      // Ambil dari chunk
      var allRecords = [];
      for (var i = 0; i < meta.totalChunks; i++) {
        var chunkKey = 'PROD_HIST_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
        var chunk = CacheWrapper.get(chunkKey);
        if (chunk) {
          allRecords = allRecords.concat(chunk);
        } else {
          // Chunk hilang, fallback ke fetch langsung
          Logger.log("  [" + year + "/" + sheetType + "] cache incomplete, refetching...");
          return _fetchAndCacheSheet(year, sheetType);
        }
      }
      Logger.log("  [" + year + "/" + sheetType + "] from cache (" + meta.count + " records)");
      return allRecords;
    }
    
    // Tidak ada cache, fetch dan cache
    return _fetchAndCacheSheet(year, sheetType);
  }

  // Filter array of records berdasarkan field dan value (case-insensitive, trim)
  function _filterRecords(records, fieldName, value) {
    var target = String(value).trim().toLowerCase();
    return records.filter(function(item) {
      var fieldVal = item.record[fieldName];
      if (fieldVal === undefined || fieldVal === null) return false;
      return String(fieldVal).trim().toLowerCase() === target;
    });
  }

  this.findByBatch = function(batchNo) {
    var allYears = TransactionalFactory.getAllYears();
    var allRecords = [];
    for (var i = 0; i < allYears.length; i++) {
      var year = allYears[i];
      for (var j = 0; j < RELEVANT_SHEET_TYPES.length; j++) {
        var sheetType = RELEVANT_SHEET_TYPES[j];
        var records = _fetchAllFromSheet(year, sheetType);
        allRecords = allRecords.concat(records);
      }
    }
    return _filterRecords(allRecords, 'batch', batchNo);
  };

  this.findByKodeBarang = function(kodeBarang) {
    var allYears = TransactionalFactory.getAllYears();
    var allRecords = [];
    for (var i = 0; i < allYears.length; i++) {
      var year = allYears[i];
      for (var j = 0; j < RELEVANT_SHEET_TYPES.length; j++) {
        var sheetType = RELEVANT_SHEET_TYPES[j];
        var records = _fetchAllFromSheet(year, sheetType);
        allRecords = allRecords.concat(records);
      }
    }
    return _filterRecords(allRecords, 'kodeBarang', kodeBarang);
  };

  this.findByNamaKonsumen = function(namaKonsumen) {
    var allYears = TransactionalFactory.getAllYears();
    var allRecords = [];
    for (var i = 0; i < allYears.length; i++) {
      var year = allYears[i];
      for (var j = 0; j < RELEVANT_SHEET_TYPES.length; j++) {
        var sheetType = RELEVANT_SHEET_TYPES[j];
        var records = _fetchAllFromSheet(year, sheetType);
        allRecords = allRecords.concat(records);
      }
    }
    return _filterRecords(allRecords, 'namaKonsumen', namaKonsumen);
  };

  this.findByField = function(fieldName, value) {
  var allYears = TransactionalFactory.getAllYears();
  var allRecords = [];
  for (var i = 0; i < allYears.length; i++) {
    var year = allYears[i];
    for (var j = 0; j < RELEVANT_SHEET_TYPES.length; j++) {
      var records = _fetchAllFromSheet(year, RELEVANT_SHEET_TYPES[j]);
      allRecords = allRecords.concat(records);
    }
  }
  return _filterRecords(allRecords, fieldName, value);
  };
}