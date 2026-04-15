// src/domain/embalage/shipping_embalage/ShippingLabelRepo.js

class ShippingLabelRepo extends BaseRepository {
  constructor() {
    super(AppConfig.DB_SHIPPING_LABEL_ID, AppConfig.DB_SHIPPING_LABEL_SHEET_NAME);
    this.startRow = AppConfig.DB_SHIPPING_LABEL_START_ROW;
    }

    getAllShippingLabelRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }

  updatePrintStatusById(id, statusBaru) {
    // 1. Buka Spreadsheet berdasarkan ID & Sheet Name dari AppConfig
    const ss = SpreadsheetApp.openById(AppConfig.DB_SHIPPING_LABEL_ID);
    const sheet = ss.getSheetByName(AppConfig.DB_SHIPPING_LABEL_SHEET_NAME);
    
    if (!sheet) throw new Error(`Sheet ${AppConfig.DB_SHIPPING_LABEL_SHEET_NAME} tidak ditemukan!`);

    const data = sheet.getDataRange().getValues();
    
    // 2. Ambil index kolom dari AppConfig (dikurangi 1 karena array mulai dari 0)
    const idIndex = AppConfig.DB_SHIPPING_LABEL_ID_COL - 1;
    const startRowIndex = AppConfig.DB_SHIPPING_LABEL_START_ROW - 1; 

    // 3. Looping mulai dari baris data (ngelewatin header)
    for (let i = startRowIndex; i < data.length; i++) {
      if (data[i][idIndex] === id) { // Cari ID yang match
        // 4. Update cell (Ingat, getRange butuh index asli mulai dari 1)
        sheet.getRange(i + 1, AppConfig.DB_SHIPPING_LABEL_PRINT_STATUS_COL).setValue(statusBaru);
        
        return { 
          success: true, 
          message: `Status ID ${id} berhasil diupdate jadi ${statusBaru}` 
        };
      }
    }

    throw new Error(`Data dengan ID ${id} tidak ditemukan di database.`);
  }
}