// source/server/service/batch/BatchMasterService.js

/**
 * Service untuk master batch.
 * Operasi Update: soft‑delete + append baru.
 * Mendukung filter statues pada setiap pembacaan.
 */
function BatchMasterService(repository) {
  this.repo = repository;
  this.currentUser = null;

  this.setCurrentUser = function (user) {
    this.currentUser = user;
  };

  // ─── PRIVATE ──────────────────────────────────────────────────

  /** Siapkan record baru (isi createdAt/updatedAt, generate ID jika belum ada) */
  this._prepareNewRecord = function (data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser?.email);
    const now = audit.updatedAt;
    return {
      id: data.id || AppUtils.generateUUID(),
      createdAt: data.createdAt || now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      statues: data.statues || 'ACTIVE',
      ...data   // akan menimpa dengan field yang diberikan
    };
  };

  /** Filter array record berdasarkan statues */
  this._filterByStatues = function (records, statues) {
    if (!statues) {
      // Default: exclude DELETED (hanya ACTIVE/INACTIVE)
      return records.filter(r => (r.statues || '').toUpperCase() !== 'DELETED');
    }
    if (Array.isArray(statues)) {
      const set = new Set(statues.map(s => s.toUpperCase()));
      return records.filter(r => set.has((r.statues || '').toUpperCase()));
    }
    const target = statues.toUpperCase();
    return records.filter(r => (r.statues || '').toUpperCase() === target);
  };

  // ─── PUBLIC API ───────────────────────────────────────────────

  /**
   * Ambil semua batch, bisa difilter oleh statues.
   * @param {string|string[]} [statues] - status filter, e.g. 'ACTIVE' atau ['ACTIVE','INACTIVE']
   */
  this.getAll = function (statues) {
    const all = this.repo.getAll();
    return this._filterByStatues(all, statues);
  };

  this.getById = function (id) {
    return this.repo.findById(id);
  };

  /**
   * Paginated dengan filter statues.
   */
  this.getPaginated = function (page, limit, statues) {
    const all = this.getAll(statues);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      page: page,
      limit: limit,
      total: all.length,
      totalPages: Math.ceil(all.length / limit)
    };
  };

  /**
   * Cari berdasarkan standard field (exact match, case‑insensitive).
   */
  this.findByField = function (field, value) {
    return this.repo.findByField(field, value);
  };

  /** Create batch baru */
  this.create = function (data) {
    const newRec = this._prepareNewRecord(data);
    this.repo.create(newRec);
    this.repo.touchGlobalCells();
    return newRec;
  };

  /**
   * Update batch:
   * 1. Cari record existing
   * 2. Soft‑delete existing (STATUES = 'DELETED')
   * 3. Buat record baru dengan ID yang sama & data gabungan
   */
  this.update = function (id, data) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('Batch not found');

    // Soft‑delete baris lama
    existing.statues = 'DELETED';
    this.repo.update(id, existing);

    // Gabungkan data baru (pertahankan field yang tidak diubah)
    const newData = { ...existing, ...data };
    newData.id = id;                     // ID tetap
    newData.statues = 'ACTIVE';          // pastikan status aktif
    const updatedRec = this._prepareNewRecord(newData);
    this.repo.create(updatedRec);        // append baris baru

    this.repo.touchGlobalCells();
    return updatedRec;
  };

  /** Soft delete: set STATUES = 'DELETED' */
  this.delete = function (id) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('Batch not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);
    this.repo.touchGlobalCells();
    return { success: true, id };
  };
}