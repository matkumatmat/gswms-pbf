// source/server/adapters/history/HistoryShippingEmbalageReaderAdapter.js

/**
 * Adapter untuk membaca riwayat shipping embalage (ALL_SEMB) dari semua tahun
 * Menggunakan TransactionalShippingEmbalageFactory untuk akses data per tahun
 * Mendukung caching chunked seperti ProductHistoryReaderAdapter
 */
function HistoryShippingEmbalageReaderAdapter() {
  var MAX_RECORDS_PER_CHUNK = 100;

  // Ambil data dari sheet (tanpa cache dulu), simpan chunked cache
  function _fetchAndCacheYear(year) {
    var start = new Date();
    var service;
    try {
      service = TransactionalShippingEmbalageFactory.getService(year);
    } catch(e) {
      Logger.log("  [" + year + "] ERROR: cannot get service - " + e.message);
      return [];
    }
    var records;
    try {
      records = service.getAll();
    } catch(e) {
      Logger.log("  [" + year + "] ERROR: " + e.message);
      return [];
    }
    var elapsed = (new Date() - start) / 1000;
    Logger.log("  [" + year + "] fetched " + records.length + " records in " + elapsed.toFixed(2) + "s");

    // Konversi ke format yang akan disimpan (tambah metadata tahun)
    var result = records.map(function(record) {
      return { year: year, record: record };
    });

    var cacheGroup = 'TRANS_' + year + '_ALL_SEMB';
    var version = CacheRegistry.getVersion(cacheGroup);
    var ttl = CacheRegistry.getTTL(cacheGroup);

    // Hapus chunk lama
    for (var i = 0; ; i++) {
      var oldKey = 'HIST_SEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      var oldVal = CacheWrapper.get(oldKey);
      if (oldVal === null) break;
      CacheWrapper.remove(oldKey);
    }

    // Simpan chunk baru
    var totalChunks = Math.ceil(result.length / MAX_RECORDS_PER_CHUNK);
    for (var i = 0; i < totalChunks; i++) {
      var chunk = result.slice(i * MAX_RECORDS_PER_CHUNK, (i + 1) * MAX_RECORDS_PER_CHUNK);
      var chunkKey = 'HIST_SEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      CacheWrapper.put(chunkKey, chunk, ttl);
    }
    var metaKey = 'HIST_SEMB_CHUNK_META_' + cacheGroup + '_V' + version;
    CacheWrapper.put(metaKey, { totalChunks: totalChunks, count: result.length }, ttl);

    return result;
  }

  // Ambil data dari cache atau fetch
  function _fetchAllFromYear(year) {
    var cacheGroup = 'TRANS_' + year + '_ALL_SEMB';
    var version = CacheRegistry.getVersion(cacheGroup);
    var metaKey = 'HIST_SEMB_CHUNK_META_' + cacheGroup + '_V' + version;
    var meta = CacheWrapper.get(metaKey);

    if (meta && meta.totalChunks > 0) {
      var allRecords = [];
      for (var i = 0; i < meta.totalChunks; i++) {
        var chunkKey = 'HIST_SEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
        var chunk = CacheWrapper.get(chunkKey);
        if (chunk) {
          allRecords = allRecords.concat(chunk);
        } else {
          Logger.log("  [" + year + "] cache incomplete, refetching...");
          return _fetchAndCacheYear(year);
        }
      }
      Logger.log("  [" + year + "] from cache (" + meta.count + " records)");
      return allRecords;
    }
    return _fetchAndCacheYear(year);
  }

  // Filter records berdasarkan field dan value (case-insensitive)
  function _filterRecords(records, fieldName, value) {
    var target = String(value).trim().toLowerCase();
    return records.filter(function(item) {
      var fieldVal = item.record[fieldName];
      if (fieldVal === undefined || fieldVal === null) return false;
      return String(fieldVal).trim().toLowerCase() === target;
    });
  }

  // Ambil semua data dari semua tahun
  function _getAllYearsData() {
    var allYears = TransactionalShippingEmbalageFactory.getAllYears();
    var allRecords = [];
    for (var i = 0; i < allYears.length; i++) {
      var year = allYears[i];
      var records = _fetchAllFromYear(year);
      allRecords = allRecords.concat(records);
    }
    return allRecords;
  }

  // ========== PUBLIC API ==========

  /**
   * Mencari semua record berdasarkan nomor dokumen
   * @param {string} noDokumen
   * @returns {Array<{year: string, record: Object}>}
   */
  this.findByNoDokumen = function(noDokumen) {
    var allRecords = _getAllYearsData();
    return _filterRecords(allRecords, 'noDokumen', noDokumen);
  };

  /**
   * Mencari semua record berdasarkan kode barang
   * @param {string} kodeBarang
   * @returns {Array<{year: string, record: Object}>}
   */
  this.findByKodeBarang = function(kodeBarang) {
    var allRecords = _getAllYearsData();
    return _filterRecords(allRecords, 'kodeBarang', kodeBarang);
  };

  /**
   * Mencari semua record berdasarkan nama barang
   * @param {string} namaBarang
   * @returns {Array<{year: string, record: Object}>}
   */
  this.findByNamaBarang = function(namaBarang) {
    var allRecords = _getAllYearsData();
    return _filterRecords(allRecords, 'namaBarang', namaBarang);
  };

  /**
   * Mencari semua record berdasarkan field apapun
   * @param {string} fieldName - nama field di record (sesuai standard field mapping)
   * @param {string} value
   * @returns {Array<{year: string, record: Object}>}
   */
  this.findByField = function(fieldName, value) {
    var allRecords = _getAllYearsData();
    return _filterRecords(allRecords, fieldName, value);
  };

  /**
   * Mendapatkan semua record dari tahun tertentu
   * @param {string} year
   * @returns {Array<{year: string, record: Object}>}
   */
  this.getByYear = function(year) {
    return _fetchAllFromYear(year);
  };

  /**
   * Mendapatkan semua record dari semua tahun (tanpa cache warmup bisa lambat)
   * @returns {Array<{year: string, record: Object}>}
   */
  this.getAll = function() {
    return _getAllYearsData();
  };
}