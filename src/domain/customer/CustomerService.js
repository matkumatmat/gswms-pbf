// src/domain/customer/CustomerService.js

class CustomerService {
  constructor(customerRepo) {
    this.repo = customerRepo;
    this.defaultLimit = 500; 

    // THE FIX: Urutan 14 Kolom sesuai CSV lu!
    // ID | NAMA KONSUMEN | KOTA/CABANG | NAMA SINGKAT | TIPE | PROVINSI | KOTA | ALAMAT | PIC | KONTAK | MAPS | STATUS | UPDATED AT | UPDATED BY
    this.tableKeys = [
      'id', 'namaKonsumen', 'kotaCabang', 'namaSingkat', 'tipe',           
      'provinsi', 'kota', 'alamat', 'pic', 'kontak',         
      'maps', 'status', 'updatedAt', 'updatedBy'       
    ];
  }

  getPaginatedData(page = 1, requestedLimit = null) {
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
    const rawData = this.repo.getPaginatedRawData(page, limit);
    const customers = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    // Filter data kosong biar tabel lu nggak sampah
    return customers.filter(c => c.namaKonsumen !== null && c.namaKonsumen !== '');
  }

  /**
   * ADJUSTMENT: Fungsi Simpan Baru yang Sinkron dengan 14 Kolom CSV
   */
  create(data) {
    const id = AppUtils.generateUUID();
    const audit = AppUtils.getAuditTrail();
    
    // Susun array 14 kolom untuk di-append ke Spreadsheet
    const row = [
      id,                          // Col A: ID
      data.namaKonsumen,           // Col B: Nama
      data.kotaCabang || '-',      // Col C: Cabang
      data.namaSingkat || '-',     // Col D: Singkatan
      data.tipe || 'REGULER',      // Col E: Tipe
      data.provinsi || '-',        // Col F: Provinsi
      data.kota || '-',            // Col G: Kota
      data.alamat || '-',          // Col H: Alamat
      data.pic || '-',             // Col I: PIC
      data.kontak || '-',          // Col J: Kontak
      data.maps || '-',            // Col K: URL Maps
      'ACTIVE',                    // Col L: Status default
      audit.updatedAt,             // Col M: Timestamp
      audit.updatedBy              // Col N: Email User
    ];

    // Simpan ke sheet via Repo
    this.repo.appendRow(row);
    
    // Reset cache biar data barunya langsung nongol di UI
    AppUtils.invalidateCache(AppConfig.DB_CUSTOMER_SHEET_NAME);
    
    return { id, ...data };
  }
}