// source/server/adapters/history/HistoryProductEmbalageReaderAdapter.js

/**
 * Adapter untuk membaca riwayat embalage produk (ALL_PEMB) dari semua tahun.
 * Menggunakan TransactionalProductEmbalageFactory untuk akses data per tahun.
 *
 * Mendukung chunked caching via CacheWrapper untuk efisiensi:
 * data dibagi per chunk MAX_RECORDS_PER_CHUNK dan disimpan dengan version key.
 *
 * Pattern identik dengan HistoryShippingEmbalageReaderAdapter.
 */
function HistoryProductEmbalageReaderAdapter() {
  /** Batas record per chunk cache (≈100KB safe limit). */
  var MAX_RECORDS_PER_CHUNK = 100;

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  /**
   * Fetch data dari sheet, simpan ke chunked cache, kembalikan hasilnya.
   * @param {string} year
   * @returns {Array<{ year: string, record: Object }>}
   */
  function _fetchAndCacheYear(year) {
    var start   = new Date();
    var service;

    try {
      service = TransactionalProductEmbalageFactory.getService(year);
    } catch(e) {
      Logger.log('[HistoryProductEmbalageReaderAdapter] [' + year + '] Cannot get service: ' + e.message);
      return [];
    }

    var records;
    try {
      records = service.getAll();
    } catch(e) {
      Logger.log('[HistoryProductEmbalageReaderAdapter] [' + year + '] Fetch error: ' + e.message);
      return [];
    }

    var elapsed = (new Date() - start) / 1000;
    Logger.log('[HistoryProductEmbalageReaderAdapter] [' + year + '] Fetched '
      + records.length + ' records in ' + elapsed.toFixed(2) + 's');

    var result = records.map(function(record) {
      return { year: year, record: record };
    });

    // Simpan ke chunked cache
    var cacheGroup  = 'TRANS_' + year + '_ALL_PEMB'; 
    var version     = CacheRegistry.getVersion(cacheGroup);
    var ttl         = CacheRegistry.getTTL(cacheGroup);

    // Hapus chunk lama
    for (var i = 0; ; i++) {
      var oldKey = 'HIST_PEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      var oldVal = CacheWrapper.get(oldKey);
      if (oldVal === null) break;
      CacheWrapper.remove(oldKey);
    }

    // Simpan chunk baru
    var totalChunks = Math.ceil(result.length / MAX_RECORDS_PER_CHUNK);
    for (var i = 0; i < totalChunks; i++) {
      var chunk    = result.slice(i * MAX_RECORDS_PER_CHUNK, (i + 1) * MAX_RECORDS_PER_CHUNK);
      var chunkKey = 'HIST_PEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
      CacheWrapper.put(chunkKey, chunk, ttl);
    }

    // Simpan metadata
    var metaKey = 'HIST_PEMB_CHUNK_META_' + cacheGroup + '_V' + version;
    CacheWrapper.put(metaKey, { totalChunks: totalChunks, count: result.length }, ttl);

    return result;
  }

  /**
   * Ambil data dari chunked cache, atau fetch & cache jika tidak tersedia.
   * @param {string} year
   * @returns {Array<{ year: string, record: Object }>}
   */
  function _fetchAllFromYear(year) {
    var cacheGroup = 'TRANS_' + year + '_ALL_PEMB';
    var version    = CacheRegistry.getVersion(cacheGroup);
    var metaKey    = 'HIST_PEMB_CHUNK_META_' + cacheGroup + '_V' + version;
    var meta       = CacheWrapper.get(metaKey);

    if (meta && meta.totalChunks > 0) {
      var allRecords = [];
      for (var i = 0; i < meta.totalChunks; i++) {
        var chunkKey = 'HIST_PEMB_CHUNK_' + cacheGroup + '_V' + version + '_' + i;
        var chunk    = CacheWrapper.get(chunkKey);
        if (chunk) {
          allRecords = allRecords.concat(chunk);
        } else {
          Logger.log('[HistoryProductEmbalageReaderAdapter] [' + year + '] Cache chunk missing, refetching...');
          return _fetchAndCacheYear(year);
        }
      }
      Logger.log('[HistoryProductEmbalageReaderAdapter] [' + year + '] From cache ('
        + meta.count + ' records)');
      return allRecords;
    }

    return _fetchAndCacheYear(year);
  }

  /**
   * Gabungkan records dari semua tahun yang dikonfigurasi.
   * @returns {Array<{ year: string, record: Object }>}
   */
  function _getAllYearsData() {
    var allYears   = TransactionalProductEmbalageFactory.getAllYears();
    var allRecords = [];
    for (var i = 0; i < allYears.length; i++) {
      allRecords = allRecords.concat(_fetchAllFromYear(allYears[i]));
    }
    return allRecords;
  }

  /**
   * Filter records berdasarkan field standard dan value (case-insensitive, trim).
   * Field yang dicari adalah standard field (camelCase), bukan header name.
   *
   * @param {Array<{ year: string, record: Object }>} records
   * @param {string} standardField - Standard field name di record (e.g. 'kodeBarang')
   * @param {string} value
   * @returns {Array<{ year: string, record: Object }>}
   */
  function _filterRecords(records, standardField, value) {
    var target = String(value).trim().toLowerCase();
    return records.filter(function(item) {
      var fieldVal = item.record[standardField];
      if (fieldVal === undefined || fieldVal === null) return false;
      return String(fieldVal).trim().toLowerCase() === target;
    });
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * Cari record berdasarkan nomor batch.
   * @param {string} batch
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByBatch = function(batch) {
    return _filterRecords(_getAllYearsData(), 'batch', batch);
  };

  /**
   * Cari record berdasarkan kode barang.
   * @param {string} kodeBarang
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByKodeBarang = function(kodeBarang) {
    return _filterRecords(_getAllYearsData(), 'kodeBarang', kodeBarang);
  };

  /**
   * Cari record berdasarkan nama barang.
   * @param {string} namaBarang
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByNamaBarang = function(namaBarang) {
    return _filterRecords(_getAllYearsData(), 'namaBarang', namaBarang);
  };

  /**
   * Cari record berdasarkan nama konsumen.
   * @param {string} namaKonsumen
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByNamaKonsumen = function(namaKonsumen) {
    return _filterRecords(_getAllYearsData(), 'namaKonsumen', namaKonsumen);
  };

  /**
   * Generic: cari berdasarkan standard field name apapun.
   * @param {string} standardField
   * @param {string} value
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByField = function(standardField, value) {
    return _filterRecords(_getAllYearsData(), standardField, value);
  };

  /**
   * Ambil semua record dari tahun tertentu.
   * @param {string} year
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.getByYear = function(year) {
    return _fetchAllFromYear(year);
  };

  /**
   * Ambil semua record dari semua tahun.
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.getAll = function() {
    return _getAllYearsData();
  };
}