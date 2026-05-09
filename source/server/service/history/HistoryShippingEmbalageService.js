// source/server/service/history/HistoryShippingEmbalageService.js

function HistoryShippingEmbalageService(repository) {
  this.repo = repository;
  this.currentUser = null;

  this.setCurrentUser = function(user) {
    this.currentUser = user;
  };

  // Normalisasi record: tambah tahun, dan konversi nilai numerik
  this._normalizeRecord = function(item) {
    var record = item.record;
    var tahun = item.year;
    return {
      id: record.id || null,
      createdAt: record.createdAt || null,
      updatedAt: record.updatedAt || null,
      updatedBy: record.updatedBy || null,
      idSemb: record.idSemb || null,
      statues: record.statues || null,
      type: record.type || null,
      tanggal: record.tanggal || null,
      noDokumen: record.noDokumen || record.noDok || null,
      kodeBarang: record.kodeBarang || null,
      namaBarang: record.namaBarang || null,
      kategori: record.kategori || null,
      satuan: record.satuan || null,
      penerimaan: NumberUtils.toNumber(record.penerimaan || 0),
      distribusi: NumberUtils.toNumber(record.distribusi || 0),
      catatan: record.catatan || null,
      tahun: tahun,
      jenisTransaksi: 'SHIPPING_EMBALAGE'
    };
  };

  // Filter tanggal, sorting, limit
  this._applyOptions = function(items, options) {
    if (!options) return items;
    var result = items.slice();

    if (options.startDate) {
      var start = new Date(options.startDate);
      result = result.filter(function(r) { return r.tanggal && new Date(r.tanggal) >= start; });
    }
    if (options.endDate) {
      var end = new Date(options.endDate);
      result = result.filter(function(r) { return r.tanggal && new Date(r.tanggal) <= end; });
    }
    result.sort(function(a, b) { return new Date(a.tanggal) - new Date(b.tanggal); });
    if (options.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }
    return result;
  };

  // ========== PUBLIC API ==========

  /**
   * Mendapatkan riwayat berdasarkan nomor dokumen
   * @param {string} noDokumen
   * @param {Object} options - { startDate, endDate, limit }
   * @returns {Array<Object>}
   */
  this.getHistoryByNoDokumen = function(noDokumen, options) {
    if (!noDokumen) throw new Error('No dokumen required');
    var raw = this.repo.findByNoDokumen(noDokumen);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  /**
   * Mendapatkan riwayat berdasarkan kode barang
   * @param {string} kodeBarang
   * @param {Object} options
   * @returns {Array<Object>}
   */
  this.getHistoryByKodeBarang = function(kodeBarang, options) {
    if (!kodeBarang) throw new Error('Kode barang required');
    var raw = this.repo.findByKodeBarang(kodeBarang);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  /**
   * Mendapatkan riwayat berdasarkan nama barang
   * @param {string} namaBarang
   * @param {Object} options
   * @returns {Array<Object>}
   */
  this.getHistoryByNamaBarang = function(namaBarang, options) {
    if (!namaBarang) throw new Error('Nama barang required');
    var raw = this.repo.findByNamaBarang(namaBarang);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  /**
   * Mendapatkan riwayat berdasarkan field apapun
   * @param {string} fieldName
   * @param {string} value
   * @param {Object} options
   * @returns {Array<Object>}
   */
  this.getHistoryByField = function(fieldName, value, options) {
    if (!fieldName || !value) throw new Error('fieldName and value required');
    var raw = this.repo.findByField(fieldName, value);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  /**
   * Mendapatkan semua riwayat (hati-hati dengan ukuran data)
   * @param {Object} options
   * @returns {Array<Object>}
   */
  this.getAllHistory = function(options) {
    var raw = this.repo.getAll();
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  /**
   * Mendapatkan riwayat per tahun
   * @param {string} year
   * @param {Object} options
   * @returns {Array<Object>}
   */
  this.getHistoryByYear = function(year, options) {
    if (!year) throw new Error('Year required');
    var raw = this.repo.getByYear(year);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };
}