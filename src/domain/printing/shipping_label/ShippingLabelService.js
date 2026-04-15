// src/domain/printing/shipping_label/ShippingLabelService.js

class ShippingLabelService {
  constructor(repo) {
    this.repo = repo;
    this.defaultLimit = 500;
    this.tableKeys = [
      'id', 'tanggal', 'noDokumen', 'customerId', 'namaCustomer', 
      'cabangCustomer', 'payloadRecipient', 'payloadTotalBox', 
      'payloadBoxes', 'payloadQr', 'urlLabel', 'printStatus', 
      'shipStatus', 'updatedAt', 'updatedBy'
    ];
  }

  /**
   * Helper internal untuk memproses field payload
   */
  _processPayloadFields(labels) {
    return labels.map(label => {
      // Cari key yang mengandung kata 'payload' lalu parse
      Object.keys(label).forEach(key => {
        if (key.toLowerCase().includes('payload')) {
          label[key] = AppUtils.safeParseJson(label[key]);
        }
      });
      return label;
    });
  }

  getPaginatedData(page = 1, requestedLimit = null) {
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
    const rawData = this.repo.getPaginatedRawData(page, limit);
    let labels = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    
    labels = labels.filter(e => e.customerId && e.customerId !== '');
    return this._processPayloadFields(labels);
  }

  /**
   * Fungsi untuk insert data baru via doPost
   */
create(data) {
    // 1. Generate ID dan Audit Trail
    const id = AppUtils.generateUUID();
    const audit = AppUtils.getAuditTrail();
    
    // 2. Susun baris sesuai urutan kolom A-O
    const row = [
      id,
      data.tanggal || new Date(),
      data.noDokumen,
      data.customerId,
      data.namaCustomer,      // <--- SEKARANG INI BISA DIISI
      data.cabangCustomer,    // <--- SEKARANG INI BISA DIISI
      JSON.stringify(data.payloadRecipient || {}),
      data.payloadTotalBox || 1,
      JSON.stringify(data.payloadBoxes || []),
      JSON.stringify(data.payloadQr || {}),
      `?page=${id}`,          // <--- MAGIC! URL LANGSUNG JADI ?page=UUID
      data.printStatus || 'BELUM_CETAK',
      data.shipStatus || 'PROSES',
      audit.updatedAt,
      audit.updatedBy
    ];

    const result = this.repo.appendRow(row);
    AppUtils.invalidateCache(AppConfig.DB_SHIPPING_LABEL_SHEET_NAME);
    
    return { id, ...data };
  }

    updatePrintStatus(payload) {
    const { id, status } = payload; // <-- GANTI JADI ID
    
    if (!id || !status) {
      throw new Error("Payload tidak lengkap. Butuh 'id' dan 'status'.");
    }

    return this.repo.updatePrintStatusById(id, status);
  }
}