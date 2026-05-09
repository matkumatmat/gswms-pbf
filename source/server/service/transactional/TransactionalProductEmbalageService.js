// source/server/service/transactional/TransactionalProductEmbalageService.js

/**
 * Service untuk embalage produk (ALL_PEMB).
 * Menangani mapping antara standard field names dan header names,
 * audit trail, ID generation, serta business logic CRUD.
 *
 * Mendukung pencarian spesifik: kodeBarang, namaBarang, batch, noDok,
 * serta generic findByField.
 *
 * @param {Object}                               yearConfig  - Konfigurasi tahun
 * @param {Object}                               sheetConfig - Konfigurasi sheet (fieldMapping, dll)
 * @param {TransactionalProductEmbalageRepository} repository  - DI repository
 */
function TransactionalProductEmbalageService(yearConfig, sheetConfig, repository) {
  this.yearConfig   = yearConfig;
  this.sheetConfig  = sheetConfig;
  this.repo         = repository;
  this.fieldMapping = sheetConfig.fieldMapping; // { standardField: "HEADER NAME" }
  this.currentUser  = null;

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  /**
   * Set user untuk audit trail.
   * @param {{ email: string }} user
   */
  this.setCurrentUser = function(user) { this.currentUser = user; };

  /**
   * Konversi standard object → raw (key = header name).
   * @param {Object} std
   * @returns {Object}
   */
  this._toRaw = function(std) {
    const raw = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      if (std[stdField] !== undefined) raw[headerName] = std[stdField];
    }
    return raw;
  };

  /**
   * Konversi raw (key = header name) → standard object.
   * @param {Object|null} raw
   * @returns {Object|null}
   */
  this._toStandard = function(raw) {
    if (!raw) return null;
    const std = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      std[stdField] = (raw[headerName] !== undefined) ? raw[headerName] : null;
    }
    std._year      = this.yearConfig.year;
    std._sheetType = this.sheetConfig.type;
    return std;
  };

  /**
   * Siapkan raw object untuk CREATE (inject ID, audit, defaults).
   * @param {Object} data - Standard field data dari caller
   * @returns {Object} raw object siap append
   */
  this._prepareNewRecord = function(data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const now   = audit.updatedAt;
    const std   = Object.assign({
      id:        AppUtils.generateUUID(),
      createdAt: now,
      updatedAt: now,
      updatedBy: audit.updatedBy
    }, data);
    return this._toRaw(std);
  };

  /**
   * Siapkan raw object untuk UPDATE (merge existing + patch + audit).
   * @param {string} id
   * @param {Object} data - Partial standard field data
   * @returns {Object} raw object siap updateById
   */
  this._prepareUpdate = function(id, data) {
    const existingStd = this.getById(id);
    if (!existingStd) throw new Error('Record with ID ' + id + ' not found');
    const audit      = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const updatedStd = Object.assign({}, existingStd, data, {
      updatedAt: audit.updatedAt,
      updatedBy: audit.updatedBy
    });
    return this._toRaw(updatedStd);
  };

  /**
   * Resolusi header name dari standard field name.
   * Fallback ke nilai asli jika tidak ada di mapping.
   * @param {string} standardField
   * @returns {string}
   */
  this._resolveHeaderName = function(standardField) {
    return this.fieldMapping[standardField] || standardField;
  };

  // ─── PUBLIC CRUD ───────────────────────────────────────────────────────────

  /**
   * Ambil semua record (seluruh sheet).
   * @returns {Object[]}
   */
  this.getAll = function() {
    return this.repo.adapter.getPaginated(1, 999999).data
      .map(r => this._toStandard(r));
  };

  /**
   * Ambil data secara paginated.
   * @param {number} page
   * @param {number} limit
   * @returns {{ data: Object[], page: number, limit: number, total: number, totalPages: number }}
   */
  this.getPaginated = function(page, limit) {
    const result = this.repo.adapter.getPaginated(page, limit);
    return {
      data:       result.data.map(r => this._toStandard(r)),
      page:       page,
      limit:      limit,
      total:      result.total,
      totalPages: Math.ceil(result.total / limit)
    };
  };

  /**
   * Ambil satu record berdasarkan ID.
   * @param {string} id
   * @returns {Object|null}
   */
  this.getById = function(id) {
    return this._toStandard(this.repo.findById(id));
  };

  /**
   * Generic: cari berdasarkan standard field name.
   * @param {string} standardField - Standard field (e.g. 'kodeBarang', 'batch')
   * @param {string} value
   * @returns {Object[]}
   */
  this.findByField = function(standardField, value) {
    const headerName = this._resolveHeaderName(standardField);
    return this.repo.findByField(headerName, value)
      .map(r => this._toStandard(r));
  };

  /**
   * Cari berdasarkan kode barang.
   * @param {string} kodeBarang
   * @returns {Object[]}
   */
  this.findByKodeBarang = function(kodeBarang) {
    return this.findByField('kodeBarang', kodeBarang);
  };

  /**
   * Cari berdasarkan nama barang.
   * @param {string} namaBarang
   * @returns {Object[]}
   */
  this.findByNamaBarang = function(namaBarang) {
    return this.findByField('namaBarang', namaBarang);
  };

  /**
   * Cari berdasarkan nomor batch.
   * @param {string} batch
   * @returns {Object[]}
   */
  this.findByBatch = function(batch) {
    return this.findByField('batch', batch);
  };

  /**
   * Cari berdasarkan nomor dokumen.
   * @param {string} noDok
   * @returns {Object[]}
   */
  this.findByNoDok = function(noDok) {
    return this.findByField('noDok', noDok);
  };

  /**
   * Buat record baru.
   * @param {Object} data - Standard field data
   * @returns {Object} Standard record yang baru dibuat
   */
  this.create = function(data) {
    const raw = this._prepareNewRecord(data);
    this.repo.create(raw);
    return this._toStandard(raw);
  };

  /**
   * Update record berdasarkan ID.
   * @param {string} id
   * @param {Object} data - Partial standard field data
   * @returns {Object} Record setelah diupdate
   */
  this.update = function(id, data) {
    const raw = this._prepareUpdate(id, data);
    this.repo.update(id, raw);
    return this.getById(id);
  };

  /**
   * Soft delete record (STATUES = 'DELETED').
   * @param {string} id
   * @returns {{ success: boolean, id: string }}
   */
  this.delete = function(id) {
    this.repo.delete(id);
    return { success: true, id: id };
  };
}