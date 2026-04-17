// src/migration/InitialFillHotStorage.js

function runInitialFillHotStorage() {
  Logger.log("Memulai Initial Fill Hot Storage (Current)...");

  const hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
  const map = hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;

  const ssHot = SpreadsheetApp.openById(hotConfig.DB_DISTRIBUSI_CURRENT_ID);
  const sheetHot = ssHot.getSheetByName(hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME);

  if (!sheetHot) {
    Logger.log("Sheet " + hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME + " tidak ditemukan.");
    return;
  }

  const lastRow = sheetHot.getLastRow();
  if (lastRow < hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW) {
    Logger.log("Data Hot Storage kosong.");
    return;
  }

  Logger.log("Menarik data ke memori...");
  const rawData = sheetHot.getRange(
    hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW, 
    1, 
    lastRow - hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW + 1, 
    sheetHot.getLastColumn()
  ).getValues();

  const stockMap = new Map(); 
  let validRowCount = 0;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];

    // Konversi ke string dan buang spasi, mengamankan format
    const batch = String(row[map.batch - 1] || '').trim();
    
    // Abaikan jika batch kosong atau membaca baris header dari sumber
    if (!batch || batch.toUpperCase() === 'BATCH' || batch.toUpperCase() === 'BATCH NUMBER') {
      continue;
    }

    const keterangan = String(row[map.keterangan - 1] || '').toUpperCase();
    const konsumen = String(row[map.namaKonsumen - 1] || '').toUpperCase();

    // Filter data tidak valid (Revisi dan Saldo Awal)
    if (keterangan.includes('REVISI') || konsumen.includes('SALDO AWAL')) {
      continue;
    }

    const kodeBarang = String(row[map.kodeBarang - 1] || '-').trim();
    const qtyIn = parseFloat(row[map.penerimaan - 1]) || 0;
    const qtyOut = parseFloat(row[map.distribusi - 1]) || 0;

    if (!stockMap.has(batch)) {
      stockMap.set(batch, { kodeBarang: kodeBarang, in: 0, out: 0 });
    }

    const current = stockMap.get(batch);
    current.in += qtyIn;
    current.out += qtyOut;

    validRowCount++;
  }

  Logger.log("Berhasil memproses " + validRowCount + " baris data valid.");

  const timestamp = new Date();
  const outputData = [];

  stockMap.forEach((data, batchKey) => {
    const balance = data.in - data.out;
    outputData.push([batchKey, data.kodeBarang, data.in, data.out, balance, timestamp]);
  });

  if (outputData.length === 0) {
    Logger.log("Tidak ada data hasil rekap.");
    return;
  }

  const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  let sheetRekap = ssMaster.getSheetByName(AppConfig.DB_STOK_REKAP_SHEET_NAME);

  if (!sheetRekap) {
    sheetRekap = ssMaster.insertSheet(AppConfig.DB_STOK_REKAP_SHEET_NAME);
    sheetRekap.appendRow(["BATCH", "KODE BARANG", "PENERIMAAN", "DISTRIBUSI", "STOK", "UPDATED AT"]);
    sheetRekap.setFrozenRows(1);
    sheetRekap.getRange("A1:F1").setFontWeight("bold").setBackground("#f8fafc");
  }

  const rekapLastRow = sheetRekap.getLastRow();
  if (rekapLastRow > 1) {
    sheetRekap.getRange(2, 1, rekapLastRow - 1, 6).clearContent();
  }

  // Kunci format kolom A dan B sebagai Plain Text agar angka nol tidak hilang
  sheetRekap.getRange("A:B").setNumberFormat("@");

  // Tulis ulang SEKALIGUS dari baris ke-2
  sheetRekap.getRange(2, 1, outputData.length, 6).setValues(outputData);

  Logger.log("Proses selesai. " + outputData.length + " batch berhasil direkap ke " + AppConfig.DB_STOK_REKAP_SHEET_NAME + ".");
}