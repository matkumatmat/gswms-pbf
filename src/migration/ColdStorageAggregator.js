// src/migration/ColdStorageAggregator.js

function runColdStorageAggregator() {
  Logger.log("Memulai proses agregasi Cold Storage (Data Historis)...");

  const coldConfigs = AppConfig.DB_DISTRIBUSI_COLD;
  const coldMap = new Map(); 
  let totalYearsProcessed = 0;

  // Iterasi setiap tahun yang terdaftar di AppConfig
  coldConfigs.forEach(config => {
    const year = config.DB_DISTRIBUSI_YEAR;
    const ssId = config.DB_DISTRIBUSI_ID;

    // Validasi: Lewati jika ID belum diatur atau masih dummy
    if (!ssId || ssId === 'NOT_SET_YET' || ssId === 'not_set_yet') {
      Logger.log("Melewati tahun " + year + ": ID Spreadsheet tidak valid.");
      return;
    }

    try {
      const ss = SpreadsheetApp.openById(ssId);
      const sheet = ss.getSheetByName(config.DB_DISTRIBUSI_SHEET_NAME);
      
      if (!sheet) {
        Logger.log("Melewati tahun " + year + ": Sheet tidak ditemukan.");
        return;
      }

      const lastRow = sheet.getLastRow();
      if (lastRow < config.DB_DISTRIBUSI_START_ROW) return;

      Logger.log("Memproses data tahun " + year + "...");
      const mapper = config.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
      
      // Mengambil data secara bulk untuk efisiensi memori
      const rawData = sheet.getRange(
        config.DB_DISTRIBUSI_START_ROW, 
        1, 
        lastRow - config.DB_DISTRIBUSI_START_ROW + 1, 
        sheet.getLastColumn()
      ).getValues();

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const batch = String(row[mapper.batch - 1] || '').trim();

        // Filter Header dan baris kosong
        if (!batch || batch.toUpperCase() === 'BATCH' || batch.toUpperCase() === 'BATCH NUMBER') {
          continue;
        }

        const keterangan = String(row[mapper.keterangan - 1] || '').toUpperCase();
        const konsumen = String(row[mapper.namaKonsumen - 1] || '').toUpperCase();

        // Filter validasi: Abaikan REVISI dan SALDO AWAL tahun berjalan (kecuali saldo awal tahun pertama sistem)
        if (keterangan.includes('REVISI') || konsumen.includes('SALDO AWAL')) {
          continue;
        }

        const kodeBarang = String(row[mapper.kodeBarang - 1] || '-').trim();
        const qtyIn = parseFloat(row[mapper.penerimaan - 1]) || 0;
        const qtyOut = parseFloat(row[mapper.distribusi - 1]) || 0;

        if (!coldMap.has(batch)) {
          coldMap.set(batch, { kodeBarang: kodeBarang, in: 0, out: 0 });
        }

        const current = coldMap.get(batch);
        current.in += qtyIn;
        current.out += qtyOut;
      }

      totalYearsProcessed++;
      Logger.log("Selesai memproses tahun " + year);

    } catch (err) {
      Logger.log("Error pada tahun " + year + ": " + err.toString());
    }
  });

  if (coldMap.size === 0) {
    Logger.log("Tidak ada data historis yang berhasil diproses.");
    return;
  }

  // Persiapkan data output
  const timestamp = new Date();
  const outputData = [];
  coldMap.forEach((data, batchKey) => {
    const balance = data.in - data.out;
    outputData.push([batchKey, data.kodeBarang, data.in, data.out, balance, timestamp]);
  });

  // Tulis ke sheet rekap COLD
  const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  let sheetColdRekap = ssMaster.getSheetByName(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);

  if (!sheetColdRekap) {
    sheetColdRekap = ssMaster.insertSheet(AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
    sheetColdRekap.appendRow(["BATCH", "KODE BARANG", "TOTAL IN", "TOTAL OUT", "SALDO AKHIR", "LAST SYNCED"]);
    sheetColdRekap.setFrozenRows(1);
    sheetColdRekap.getRange("A1:F1").setFontWeight("bold").setBackground("#f1f5f9");
  }

  const lastRowRekap = sheetColdRekap.getLastRow();
  if (lastRowRekap > 1) {
    sheetColdRekap.getRange(2, 1, lastRowRekap - 1, 6).clearContent();
  }

  // Kunci format sebagai Plain Text
  sheetColdRekap.getRange("A:B").setNumberFormat("@");
  
  sheetColdRekap.getRange(2, 1, outputData.length, 6).setValues(outputData);

  Logger.log("Proses Selesai. " + totalYearsProcessed + " tahun berhasil diakumulasi ke " + AppConfig.DB_STOK_COLD_REKAP_SHEET_NAME);
}