// source/server/service/transactional/ProductReceivingService.js

/**
 * Product Receiving Service (ALL_RCV).
 * 
 * DUA MODE INPUT:
 *   - batchId           (Web/AppSheet) → langsung ambil dari master
 *   - batchNo           (Spreadsheet/Manual) → cari batch, wajib ditemukan
 *
 * ENRICHMENT:
 *   - kodeBarang, namaBarang, dll. berasal dari Product Master (via productId di batch)
 *   - jika product tidak ditemukan → TRANSAKSI DITOLAK
 *
 * @param {Object}   yearConfig     - Konfigurasi tahun dari AppConfig
 * @param {Object}   sheetConfig    - Konfigurasi sheet ALL_RCV
 * @param {TransactionalRepository} repository
 * @param {BatchMasterService}      batchService
 * @param {ProductMasterService}    productService
 */
function ProductReceivingService(yearConfig, sheetConfig, repository, batchService, productService) {
  this.repo = repository;
  this.batchService = batchService;
  this.productService = productService;
  this.fieldMapping = sheetConfig.fieldMapping;
  this.currentUser = null;

  const constants = DomainConstants.constants;

  // ─── REVERSE MAPPING (header sheet → standard field) ──────
  const reverseMapping = {};
  for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
    reverseMapping[headerName] = stdField;
  }

  // ────────── PRIVATE HELPERS ──────────────────────────────

  /** Konversi RAW (objek dari sheet) ke STANDARD */
  const toStandard = (rawObj) => {
    if (!rawObj) return null;
    const std = {};
    for (const header in rawObj) {
      const stdField = reverseMapping[header];
      if (stdField) std[stdField] = rawObj[header];
    }
    return std;
  };

  /** Konversi STANDARD ke RAW (siap tulis ke sheet) */
  const toRaw = (stdObj) => {
    const raw = {};
    for (const [stdField, header] of Object.entries(this.fieldMapping)) {
      if (stdObj[stdField] !== undefined) raw[header] = stdObj[stdField];
    }
    return raw;
  };

  /** Siapkan record baru lengkap dengan audit trail */
  const prepareRecord = (data) => {
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

  /**
   * Resolve batch dari payload.
   * Prioritaskan batchId (web), baru batchNo (spreadsheet).
   */
  const resolveBatch = (data) => {
    if (data.batchId) {
      const batch = this.batchService.getById(data.batchId);
      if (!batch) throw new Error(`Batch dengan ID "${data.batchId}" tidak ditemukan.`);
      return batch;
    }
    if (data.batchNo) {
      const batchNo = data.batchNo.trim();
      const batches = this.batchService.findByField('batch', batchNo);
      if (batches.length === 0) throw new Error(`Batch "${batchNo}" tidak ditemukan.`);
      return batches[0];
    }
    throw new Error('Kirim batchId (web) atau batchNo (spreadsheet).');
  };

  /**
   * Resolve product dari batch.
   * Wajib ditemukan – kalau tidak, transaksi ditolak.
   */
  const resolveProduct = (batch) => {
    if (!batch.productId) throw new Error(`Batch "${batch.batch}" tidak memiliki productId.`);
    const product = this.productService.getById(batch.productId);
    if (!product) throw new Error(`Produk dengan ID "${batch.productId}" tidak ditemukan.`);
    return product;
  };

  // ────────── PUBLIC API ──────────────────────────────────

  this.setCurrentUser = (user) => { this.currentUser = user; };

  /**
   * Buat record penerimaan baru.
   * @param {Object} data - Payload dari client
   * @returns {Object} Record standard yang sudah tersimpan
   */
  this.create = function (data) {
    // 1. Dapatkan batch + product yang terverifikasi
    const batch   = resolveBatch(data);
    const product = resolveProduct(batch);

    // 2. Validasi tipe receiving
    const type = (data.type || constants.receivingType.RECEIVING).toUpperCase();
    if (!Object.values(constants.receivingType).includes(type))
      throw new Error(`Tipe penerimaan tidak valid: ${type}`);

    // 3. Validasi kemasan (wajib diisi? Sesuaikan dengan kebutuhan)
    const jenisKemasan = (data.jenisKemasan || '').toUpperCase();
    if (jenisKemasan && !Object.values(constants.kemasanType).includes(jenisKemasan))
      throw new Error(`Jenis kemasan tidak valid: ${data.jenisKemasan}`);

    // 4. Enrich data dari product
    const kodeBarang = product.kodeBarangNew || product.kodeBarang;
    const namaBarang = product.namaBarangNew || product.namaBarang;

    // 5. Perhitungan fisik
    let   jumlahFisik     = NumberUtils.toNumber(data.jumlahFisik);
    const jumlahBucket    = NumberUtils.toNumber(data.jumlahBucket);
    const jumlahPerBucket = NumberUtils.toNumber(data.jumlahPerBucket);

    if ((!jumlahFisik || jumlahFisik === 0) && jumlahBucket > 0 && jumlahPerBucket > 0) {
      jumlahFisik = jumlahBucket * jumlahPerBucket;
    } else if (jumlahFisik === 0 && jumlahBucket === 0 && jumlahPerBucket === 0) {
      throw new Error('Jumlah fisik atau jumlah bucket harus diisi.');
    }

    // 6. Susun record ter-enrich
    const enriched = {
      type,
      tanggal: data.tanggal || new Date().toISOString(),
      jam: data.jam || null,
      noDokumen: data.noDokumen || null,
      namaKonsumen: data.namaKonsumen || null,
      kotaCabang: data.kotaCabang || null,
      kodeBarang,
      namaBarang,
      batch: batch.batch || data.batchNo,
      mfgDate: batch.mfgDate || null,
      expireDate: batch.expireDate || null,
      kondisiKemasan: data.kondisiKemasan || null,
      nomorIzinEdar: batch.nomorIzinEdar || null,
      jenisKemasan,
      jumlahFisik,
      jumlahPerBucket,
      jumlahBucket,
      catatanFisik: data.catatanFisik || null,
      placement: data.placement || null,
      productId: product.id,
      batchId: batch.id
    };

    const record = prepareRecord(enriched);
    this.repo.create(toRaw(record));
    return record;  // langsung kembalikan standard record
  };

  /**
   * Update record penerimaan.
   * @param {string} id
   * @param {Object} updates - Field yang ingin diubah
   * @returns {Object} Record hasil update
   */
  this.update = function (id, updates) {
    const rawExisting = this.repo.findById(id);
    if (!rawExisting) throw new Error(`Record dengan ID ${id} tidak ditemukan`);
    const existing = toStandard(rawExisting);

    // Validasi ulang kalau field terkait ikut diubah
    if (updates.type && !Object.values(constants.receivingType).includes(updates.type.toUpperCase()))
      throw new Error('Tipe penerimaan tidak valid');
    if (updates.jenisKemasan && !Object.values(constants.kemasanType).includes(updates.jenisKemasan.toUpperCase()))
      throw new Error('Jenis kemasan tidak valid');

    const audit = AuditUtils.getAuditTrail(this.currentUser?.email);
    const allowed = [
      'type','tanggal','jam','noDokumen','namaKonsumen','kotaCabang',
      'kondisiKemasan','jenisKemasan','jumlahFisik','jumlahPerBucket',
      'jumlahBucket','catatanFisik','placement'
    ];

    const updated = { ...existing };
    allowed.forEach(f => {
      if (updates[f] !== undefined) updated[f] = updates[f];
    });
    updated.updatedAt = audit.updatedAt;
    updated.updatedBy = audit.updatedBy;

    this.repo.update(id, toRaw(updated));
    return updated;
  };

  /**
   * Soft-delete record penerimaan.
   * @param {string} id
   * @returns {{ success: boolean, id: string }}
   */
  // this.delete = function (id) {
  //   const rawExisting = this.repo.findById(id);
  //   if (!rawExisting) throw new Error(`Record dengan ID ${id} tidak ditemukan`);
  //   const existing = toStandard(rawExisting);
  //   existing.statues = 'DELETED';
  //   this.repo.update(id, toRaw(existing));
  //   return { success: true, id };
  // };
  this.delete = function (id) {
    const rawExisting = this.repo.findById(id);
    if (!rawExisting) throw new Error(`Record dengan ID ${id} tidak ditemukan`);
    const existing = toStandard(rawExisting);
    existing.statues = 'DELETED';
    this.repo.update(id, toRaw(existing));
    this.repo.adapter.invalidateCache();
    
    // Invalidasi cache adapter jika ada method invalidateCache
    if (typeof this.repo.adapter.invalidateCache === 'function') {
        this.repo.adapter.invalidateCache();
    }
    
    return { success: true, id };
};
}