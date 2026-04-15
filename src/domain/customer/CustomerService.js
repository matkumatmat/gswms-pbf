// src/domain/customer/CustomerService.js

class CustomerService {
  constructor(customerRepo) {
    this.repo = customerRepo;
    
    // Set default limit khusus untuk domain Customer
    this.defaultLimit = 500; 

    this.tableKeys = [
      'id',             
      'namaKonsumen',   
      'kotaCabang',     
      'namaSingkat',    
      'tipe',           
      'provinsi',       
      'kota',           
      'alamat',         
      'pic',            
      'kontak',         
      'maps',           
      'status',         
      'updatedAt'       
    ];
  }

  getAllCustomers() {
    const rawData = this.repo.getAllCustomerRaw();
    const customers = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    return customers.filter(c => c.namaKonsumen !== null && c.namaKonsumen !== '');
  }

  /**
   * Method standar yang akan dipanggil oleh Router di main.js
   */
  getPaginatedData(page = 1, requestedLimit = null) {
    // Override: Kalau request tidak minta limit, pakai default limit service ini
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;

    // Panggil fungsi pagination dari BaseRepository (via CustomerRepo)
    // Asumsi di CustomerRepo: getPaginatedCustomerRaw(page, limit) memanggil super.getPaginatedRawData
    const rawData = this.repo.getPaginatedRawData(page, limit);
    
    const customers = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    return customers.filter(c => c.namaKonsumen !== null && c.namaKonsumen !== '');
  }
}