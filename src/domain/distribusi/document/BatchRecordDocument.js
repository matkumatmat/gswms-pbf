// src/domain/distribusi/document/BatchDocumentGeneratorService.js

class BatchDocumentGeneratorService {
  // Dependency Injection: Service ini membutuhkan TransactionHistoryService
  constructor(transactionHistoryService) {
    this.historyService = transactionHistoryService;
  }

  generateDocument(payload) {
    const { batchNo } = payload;
    if (!batchNo) {
      throw new Error("Nomor Batch harus disertakan untuk mencetak dokumen.");
    }

    // 1. Ambil data mentah dari Service Transaksi
    const rawHistory = this.historyService.getHistory({ batchNo });
    
    // 2. Kalkulasi saldo berjalan
    const processedData = this._calculateRunningBalance(rawHistory);
    
    // 3. Buat dokumen
    return this._buildSpreadsheet(batchNo, processedData);
  }

  _calculateRunningBalance(rawHistory) {
    let runningBalance = 0;
    const processed = [];

    rawHistory.forEach(record => {
      const kons = String(record.namaKonsumen || '').toUpperCase();

      if (kons.includes('SALDO AWAL')) return;

      runningBalance += (record.penerimaan || 0);
      runningBalance -= (record.distribusi || 0);

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

    const ss = SpreadsheetApp.create(fileName);
    const sheet = ss.getActiveSheet();
    sheet.setName("BUKU TABUNGAN");

    sheet.getRange("A1").setValue("BATCH RECORD HISTORY").setFontWeight("bold").setFontSize(14);
    sheet.getRange("A2").setValue("Batch No: " + batchNo);
    sheet.getRange("A3").setValue("Generated At: " + Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss"));

    const headers = ["TANGGAL", "KONSUMEN", "CABANG", "MASUK", "KELUAR", "SALDO", "KETERANGAN", "SUMBER"];
    sheet.getRange("A5:H5").setValues([headers]).setFontWeight("bold").setBackground("#f8fafc");

    if (dataRows.length > 0) {
      sheet.getRange(6, 1, dataRows.length, headers.length).setValues(dataRows);
      sheet.getRange(6, 4, dataRows.length, 3).setNumberFormat("#,##0");
    } else {
      sheet.getRange("A6").setValue("Tidak ada mutasi fisik yang valid.");
    }

    sheet.autoResizeColumns(1, headers.length);

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
}