// src/domain/distribusi/record/BatchRecordService.js

class BatchRecordService {
  constructor(repo) {
    this.repo = repo;
  }

/**
   * Endpoint utama yang dipanggil via UI
   * payload: { batchNo: "B12345" }
   */
  generateSheet(payload) {
    const { batchNo } = payload;
    if (!batchNo) throw new Error("Nomor Batch harus disertakan.");

    const rawHistory = this.repo.getHistoryByBatch(batchNo);
    
    // THE FIX: Hapus throw error. Kalau kosong, biarin lanjut proses.
    // Nanti di _buildSpreadsheet otomatis ditulis "Tidak ada mutasi fisik"
    
    const processedData = this._calculateRunningBalance(rawHistory);
    return this._buildSpreadsheet(batchNo, processedData);
  }

  _calculateRunningBalance(rawHistory) {
    let runningBalance = 0;
    const processed = [];

    rawHistory.forEach(record => {
      const ket = String(record.keterangan || '').toUpperCase();
      const kons = String(record.namaKonsumen || '').toUpperCase();

      // Abaikan data anomali / revisi dari perhitungan buku tabungan
      if (ket.includes('REVISI') || kons.includes('SALDO AWAL')) return;

      runningBalance += (record.penerimaan || 0);
      runningBalance -= (record.distribusi || 0);

      // Siapkan array 1D untuk row spreadsheet
      processed.push([
        record.tanggal instanceof Date ? Utilities.formatDate(record.tanggal, "GMT+7", "yyyy-MM-dd HH:mm:ss") : record.tanggal,
        record.namaKonsumen || '-',
        record.kotaCabang || '-',
        record.penerimaan || 0,
        record.distribusi || 0,
        runningBalance,
        record.keterangan || '-',
        record.sumber || '-'
      ]);
    });

    return processed;
  }

  _buildSpreadsheet(batchNo, dataRows) {
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmmss");
    const fileName = "BATCH_RECORD_" + batchNo + "_" + timestamp;

    // 1. Buat Spreadsheet Baru di Root Drive
    const ss = SpreadsheetApp.create(fileName);
    const sheet = ss.getActiveSheet();
    sheet.setName("BUKU TABUNGAN");

    // 2. Setup Header Identitas
    sheet.getRange("A1").setValue("BATCH RECORD HISTORY").setFontWeight("bold").setFontSize(14);
    sheet.getRange("A2").setValue("Batch No: " + batchNo);
    sheet.getRange("A3").setValue("Generated At: " + Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss"));

    // 3. Setup Header Tabel
    const headers = ["TANGGAL", "KONSUMEN", "CABANG", "MASUK", "KELUAR", "SALDO", "KETERANGAN", "SUMBER"];
    sheet.getRange("A5:H5").setValues([headers]).setFontWeight("bold").setBackground("#f8fafc");

    // 4. Dump Data ke Tabel
    if (dataRows.length > 0) {
      sheet.getRange(6, 1, dataRows.length, headers.length).setValues(dataRows);
      
      // Format angka ribuan untuk kolom Masuk, Keluar, Saldo
      sheet.getRange(6, 4, dataRows.length, 3).setNumberFormat("#,##0");
    } else {
      sheet.getRange("A6").setValue("Tidak ada mutasi fisik yang valid.");
    }

    // Auto-resize biar rapi
    sheet.autoResizeColumns(1, headers.length);

    // 5. Pindahkan File ke Folder Archive yang sudah didefinisikan di AppConfig
    const file = DriveApp.getFileById(ss.getId());
    const folder = DriveApp.getFolderById(AppConfig.DRIVE_ARCHIEVE_BATCH_RECORD_ID);
    file.moveTo(folder);

    return {
      batchNo: batchNo,
      fileName: fileName,
      fileUrl: file.getUrl(),
      fileId: file.getId()
    };
  }
  // Tambahin ini buat ngirim raw data history ke Frontend
  getHistory(payload) {
    const { batchNo } = payload;
    if (!batchNo) throw new Error("Nomor Batch harus disertakan.");
    return this.repo.getHistoryByBatch(batchNo);
  }
}