// src/domain/customer/CustomerRepo.js

class CustomerRepo extends BaseRepository {
  constructor() {
    // Super memanggil constructor BaseRepository(spreadsheetId, sheetName)
    super(AppConfig.DB_CUSTOMER_LOOKUP_ID, AppConfig.DB_CUSTOMER_SHEET_NAME);
    this.startRow = AppConfig.DB_CUSTOMER_START_ROW;
  }

  /**
   * Mengambil semua data customer tanpa header
   */
  getAllCustomerRaw() {
    const rawData = this.getAllRawData();
    
    // startRow = 2 artinya data dimulai dari baris ke-2 (baris 1 adalah header).
    // Karena array JavaScript index-nya mulai dari 0, kita potong (slice) sebanyak startRow - 1.
    const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
    
    return rawData.slice(skipCount);
  }
}