// src/core/BaseRepository.js

class BaseRepository {
  // Tambahkan startRow di constructor, default ke 2 (asumsi baris 1 adalah header)
  constructor(spreadsheetId, sheetName, startRow = 2) {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.startRow = startRow;
  }

  _getSheet() {
    const ss = SpreadsheetApp.openById(this.spreadsheetId);
    const sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) {
      throw new Error(`Sheet dengan nama "${this.sheetName}" tidak ditemukan di Spreadsheet ID: ${this.spreadsheetId}`);
    }
    return sheet;
  }

  getAllRawData() {
    const sheet = this._getSheet();
    return sheet.getDataRange().getValues();
  }

  /**
   * Mengambil data mentah secara spesifik sesuai Halaman & Limit
   */
  getPaginatedRawData(page = 1, limit = 100) {
    const sheet = this._getSheet();
    const lastRow = sheet.getLastRow();
    
    // Jika data kosong atau cuma ada header
    if (lastRow < this.startRow) return [];

    // Kalkulasi baris awal
    const calculatedStartRow = this.startRow + ((page - 1) * limit);
    
    // Jika user minta halaman yang isinya udah kosong
    if (calculatedStartRow > lastRow) return [];

    // Hitung sisa baris biar getRange nggak error kebablasan
    const rowsAvailable = (lastRow - calculatedStartRow) + 1;
    const rowsToFetch = Math.min(limit, rowsAvailable);
    const maxCols = sheet.getLastColumn();

    // Tarik data spesifik secara fisik
    const range = sheet.getRange(calculatedStartRow, 1, rowsToFetch, maxCols);
    return range.getValues();
  }
/**
   * Menambahkan baris baru ke bawah tabel
   */
  appendRow(rowData) {
    const sheet = this._getSheet();
    sheet.appendRow(rowData);
    
    // Panggil audit secara otomatis terhadap baris yang baru saja masuk
    if (typeof SystemTrigger !== 'undefined') {
      SystemTrigger.runAudit(sheet, sheet.getLastRow());
    }
    
    return true;
  }
}