// source/server/service/transactional/TransactionalShippingEmbalageService.js
function TransactionalShippingEmbalageService(yearConfig, sheetConfig, repository) {
  this.yearConfig = yearConfig;
  this.sheetConfig = sheetConfig;
  this.repo = repository;
  this.fieldMapping = sheetConfig.fieldMapping;
  this.currentUser = null;

  this.setCurrentUser = function(user) { this.currentUser = user; };

  this._toRaw = function(std) {
    const raw = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      if (std[stdField] !== undefined) {
        raw[headerName] = std[stdField];
      }
    }
    return raw;
  };

  this._toStandard = function(raw) {
    if (!raw) return null;
    const std = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      std[stdField] = raw[headerName] !== undefined ? raw[headerName] : null;
    }
    std._year = this.yearConfig.year;
    std._sheetType = this.sheetConfig.type;
    return std;
  };

  this._prepareNewRecord = function(data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const now = audit.updatedAt;
    const newStd = {
      id: AppUtils.generateUUID(),
      createdAt: now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      ...data
    };
    return this._toRaw(newStd);
  };

  this._prepareUpdate = function(id, data) {
    const existingStd = this.getById(id);
    if (!existingStd) throw new Error('Record not found');
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const updatedStd = { ...existingStd, ...data, updatedAt: audit.updatedAt, updatedBy: audit.updatedBy };
    return this._toRaw(updatedStd);
  };

  this.getAll = function() {
    const result = this.repo.adapter.getPaginated(1, 999999);
    return result.data.map(r => this._toStandard(r));
  };

  this.getPaginated = function(page, limit) {
    let result = this.repo.adapter.getPaginated(page, limit);
    let data = result.data.map(r => this._toStandard(r));
    return {
      data: data,
      page: page,
      limit: limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    };
  };

  this.getById = function(id) {
    const raw = this.repo.findById(id);
    return this._toStandard(raw);
  };

  // ========== PERBAIKAN DI SINI ==========
  // Method findByField untuk mencari berdasarkan standard field
  this.findByField = function(standardField, value) {
    // Konversi standard field ke header name menggunakan fieldMapping
    var headerName = this.fieldMapping[standardField];
    if (!headerName) {
      // Jika tidak ditemukan, coba langsung (mungkin sudah header)
      headerName = standardField;
    }
    const raws = this.repo.findByField(headerName, value);
    return raws.map(r => this._toStandard(r));
  };

  this.create = function(data) {
    const raw = this._prepareNewRecord(data);
    this.repo.create(raw);
    return this._toStandard(raw);
  };

  this.update = function(id, data) {
    const raw = this._prepareUpdate(id, data);
    this.repo.update(id, raw);
    return this.getById(id);
  };

  this.delete = function(id) {
    this.repo.delete(id);
    return { success: true, id };
  };
}