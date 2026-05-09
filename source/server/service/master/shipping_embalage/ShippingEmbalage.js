// source/server/service/shippingEmbalage/ShippingEmbalageMasterService.js

/**
 * Service untuk master SEMB.
 * Update: soft‑delete + append baru.
 * Get mendukung filter statues.
 */
function ShippingEmbalageMasterService(repository) {
  this.repo = repository;
  this.currentUser = null;

  this.setCurrentUser = function (user) { this.currentUser = user; };

  this._prepareNewRecord = function (data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser?.email);
    const now = audit.updatedAt;
    return {
      id: data.id || AppUtils.generateUUID(),
      createdAt: data.createdAt || now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      statues: data.statues || 'ACTIVE',
      ...data
    };
  };

  this._filterByStatues = function (records, statues) {
    if (!statues) {
      return records.filter(r => (r.statues || '').toUpperCase() !== 'DELETED');
    }
    if (Array.isArray(statues)) {
      const set = new Set(statues.map(s => s.toUpperCase()));
      return records.filter(r => set.has((r.statues || '').toUpperCase()));
    }
    const target = statues.toUpperCase();
    return records.filter(r => (r.statues || '').toUpperCase() === target);
  };

  this.getAll = function (statues) {
    return this._filterByStatues(this.repo.getAll(), statues);
  };

  this.getById = function (id) {
    return this.repo.findById(id);
  };

  this.getPaginated = function (page, limit, statues) {
    const all = this.getAll(statues);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      page, limit,
      total: all.length,
      totalPages: Math.ceil(all.length / limit)
    };
  };

  this.findByField = function (field, value) {
    return this.repo.findByField(field, value);
  };

  this.create = function (data) {
    const newRec = this._prepareNewRecord(data);
    this.repo.create(newRec);
    this.repo.touchGlobalCells();
    return newRec;
  };

  this.update = function (id, data) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('SEMB not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);
    const newData = { ...existing, ...data };
    newData.id = id;
    newData.statues = 'ACTIVE';
    const updatedRec = this._prepareNewRecord(newData);
    this.repo.create(updatedRec);
    this.repo.touchGlobalCells();
    return updatedRec;
  };

  this.delete = function (id) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('SEMB not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);
    this.repo.touchGlobalCells();
    return { success: true, id };
  };
}