// source/server/service/history/HistoryProductEmbalageService.js

/**
 * Service untuk riwayat embalage produk (ALL_PEMB).
 * Menangani normalisasi record, filter tanggal, sorting, dan limit.
 *
 * ALL_PEMB memiliki field unik: kodeBarang, namaBarang, batch, noDok,
 * namaKonsumen, kotaCabang, alokasi, sektor — semua didukung findByField.
 *
 * @param {HistoryProductEmbalageRepository} repository
 */
function HistoryProductEmbalageService(repository) {
  this.repo        = repository;
  this.currentUser = null;

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  /** @param {{ email: string }} user */
  this.setCurrentUser = function(user) { this.currentUser = user; };

  /**
   * Normalisasi raw item dari adapter ke object yang konsisten.
   * Mengkonversi nilai numerik dan menambahkan metadata tahun.
   *
   * @param {{ year: string, record: Object }} item
   * @returns {Object}
   */
  this._normalizeRecord = function(item) {
    var record = item.record;
    var tahun  = item.year;

    return {
      id:           record.id           || null,
      createdAt:    record.createdAt    || null,
      updatedAt:    record.updatedAt    || null,
      updatedBy:    record.updatedBy    || null,
      idPemb:       record.idPemb       || null,
      statues:      record.statues      || null,
      type:         record.type         || null,
      tanggal:      record.tanggal      || null,
      noDok:        record.noDok        || null,
      namaKonsumen: record.namaKonsumen || null,
      kotaCabang:   record.kotaCabang   || null,
      alokasi:      record.alokasi      || null,
      sektor:       record.sektor       || null,
      kodeBarang:   record.kodeBarang   || null,
      namaBarang:   record.namaBarang   || null,
      batch:        record.batch        || null,
      expireDate:   record.expireDate   || null,
      kategori:     record.kategori     || null,
      satuan:       record.satuan       || null,
      penerimaan:   NumberUtils.toNumber(record.penerimaan || 0),
      distribusi:   NumberUtils.toNumber(record.distribusi || 0),
      catatan:      record.catatan      || null,
      tahun:        tahun,
      jenisTransaksi: 'PRODUCT_EMBALAGE'
    };
  };

  /**
   * Terapkan filter tanggal, sorting ascending, dan limit ke array records.
   * @param {Object[]} items    - Array normalized records
   * @param {Object}   options  - { startDate, endDate, limit }
   * @returns {Object[]}
   */
  this._applyOptions = function(items, options) {
    if (!options) return items;
    var result = items.slice();

    if (options.startDate) {
      var start = new Date(options.startDate);
      result = result.filter(function(r) {
        return r.tanggal && new Date(r.tanggal) >= start;
      });
    }
    if (options.endDate) {
      var end = new Date(options.endDate);
      result = result.filter(function(r) {
        return r.tanggal && new Date(r.tanggal) <= end;
      });
    }

    result.sort(function(a, b) {
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

    if (options.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  };

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * Riwayat berdasarkan nomor batch.
   * @param {string} batch
   * @param {Object} options - { startDate, endDate, limit }
   * @returns {Object[]}
   */
  this.getHistoryByBatch = function(batch, options) {
    if (!batch) throw new Error('Batch number required');
    var raw = this.repo.findByBatch(batch);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Riwayat berdasarkan kode barang.
   * @param {string} kodeBarang
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getHistoryByKodeBarang = function(kodeBarang, options) {
    if (!kodeBarang) throw new Error('Kode barang required');
    var raw = this.repo.findByKodeBarang(kodeBarang);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Riwayat berdasarkan nama barang.
   * @param {string} namaBarang
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getHistoryByNamaBarang = function(namaBarang, options) {
    if (!namaBarang) throw new Error('Nama barang required');
    var raw = this.repo.findByNamaBarang(namaBarang);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Riwayat berdasarkan nama konsumen.
   * @param {string} namaKonsumen
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getHistoryByNamaKonsumen = function(namaKonsumen, options) {
    if (!namaKonsumen) throw new Error('Nama konsumen required');
    var raw = this.repo.findByNamaKonsumen(namaKonsumen);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Generic: riwayat berdasarkan standard field apapun.
   * @param {string} standardField
   * @param {string} value
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getHistoryByField = function(standardField, value, options) {
    if (!standardField || !value) throw new Error('standardField and value required');
    var raw = this.repo.findByField(standardField, value);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Riwayat dari tahun tertentu.
   * @param {string} year
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getHistoryByYear = function(year, options) {
    if (!year) throw new Error('Year required');
    var raw = this.repo.getByYear(year);
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };

  /**
   * Semua riwayat dari semua tahun. Gunakan dengan bijak — bisa besar.
   * @param {Object} options
   * @returns {Object[]}
   */
  this.getAllHistory = function(options) {
    var raw = this.repo.getAll();
    return this._applyOptions(raw.map(this._normalizeRecord.bind(this)), options);
  };
}