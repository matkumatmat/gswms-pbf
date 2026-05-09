// source/server/service/product/ProductMasterService.js

/**
 * Service untuk master product.
 * Update = soft‑delete baris lama + append baru dengan ID yang sama.
 * Mendukung filter statues pada operasi GET.
 */
function ProductMasterService(repository) {
  this.repo = repository;
  this.currentUser = null;

  this.setCurrentUser = (user) => { this.currentUser = user; };

  // ─── PRIVATE ──────────────────────────────────────────────────

  /** Siapkan record baru (generate ID, audit trail) */
  this._prepareNewRecord = function (data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser?.email);
    const now = audit.updatedAt;
    return {
      id: data.id || AppUtils.generateUUID(),
      createdAt: data.createdAt || now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      statues: data.statues || 'ACTIVE',
      ...data   // overwrite with provided fields
    };
  };

  /** Filter berdasar statues */
  this._filterByStatues = function (records, statues) {
    if (!statues) return records.filter(r => r.statues !== 'DELETED'); // default exclude deleted
    if (Array.isArray(statues)) {
      const set = new Set(statues.map(s => s.toUpperCase()));
      return records.filter(r => set.has((r.statues || '').toUpperCase()));
    }
    return records.filter(r => (r.statues || '').toUpperCase() === statues.toUpperCase());
  };

  // ─── PUBLIC API ───────────────────────────────────────────────

  /** Ambil semua product, bisa difilter dengan statues */
  this.getAll = function (statues) {
    const all = this.repo.getAll();
    if (statues) {
      return this._filterByStatues(all, statues);
    }
    // default: hanya ACTIVE & INACTIVE (bukan DELETED)
    return all.filter(r => r.statues !== 'DELETED');
  };

  this.getById = function (id) {
    const record = this.repo.findById(id);
    return record || null;
  };

  /** Paginated dengan filter statues */
  this.getPaginated = function (page, limit, statues) {
    const all = this.getAll(statues);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      page,
      limit,
      total: all.length,
      totalPages: Math.ceil(all.length / limit)
    };
  };

  this.findByField = function (field, value) {
    return this.repo.findByField(field, value);
  };

  /** Create product baru */
  this.create = function (data) {
    const newRec = this._prepareNewRecord(data);
    this.repo.create(newRec);
    this.repo.touchGlobalCells();
    return newRec;
  };

  /**
   * Update product:
   * 1. Cari record lama
   * 2. Tandai STATUES = 'DELETED' pada record lama
   * 3. Buat record baru dengan ID yang sama dan data baru
   */
  this.update = function (id, data) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('Product not found');

    // Soft‑delete existing
    existing.statues = 'DELETED';
    this.repo.update(id, existing);

    // Buat record baru dengan ID yang sama, ambil field yang diubah
    const newData = { ...existing, ...data };
    newData.id = id;                     // pertahankan ID
    newData.statues = 'ACTIVE';          // supaya aktif kembali
    const updatedRec = this._prepareNewRecord(newData);
    this.repo.create(updatedRec);        // append row baru

    this.repo.touchGlobalCells();
    return updatedRec;
  };

  /** Soft delete (set STATUES = 'DELETED') */
  this.delete = function (id) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('Product not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);
    this.repo.touchGlobalCells();
    return { success: true, id };
  };
}