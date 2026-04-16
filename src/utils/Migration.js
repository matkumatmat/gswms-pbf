function runInitialFillProductDataBulk() {
  const ss = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  const sheet = ss.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
  const startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < startRow) return;

  Logger.log("Menarik data ke memori...");
  
  // 1. BACA SEKALI JALAN: Tarik range utuh ke memori array
  const range = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol);
  const data = range.getValues();

  // Index array (ingat: array itu 0-based, jadi dikurang 1 dari nomor kolom)
  // ID = Kolom A (0), Batch = Kolom H (7), InfoUrl = Kolom P (15), PLT = Kolom Q (16)
  const idIdx = 0; 
  const batchIdx = 7;
  const urlIdx = 15;
  const pltIdx = 16;

  let updateCount = 0;

  Logger.log("Memproses " + data.length + " baris di memori...");

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Format PLT
    const currentPlt = row[pltIdx];
    const formattedPlt = ProductDataHelper.formatPltToJson(currentPlt);
    if (formattedPlt !== currentPlt) {
      data[i][pltIdx] = formattedPlt;
      updateCount++;
    }

    // Format URL
    const currentUrl = row[urlIdx];
    const rowDataObj = {
      id: row[idIdx],
      batch: row[batchIdx]
    };
    const smartUrl = ProductDataHelper.generateInfoUrl(currentUrl, rowDataObj);
    if (smartUrl !== currentUrl) {
      data[i][urlIdx] = smartUrl;
      updateCount++;
    }
  }

  // 2. TULIS SEKALI JALAN: Tumpahkan kembali data yang udah mateng ke Spreadsheet
  if (updateCount > 0) {
    Logger.log("Menyimpan " + updateCount + " sel ke Spreadsheet...");
    range.setValues(data);
    Logger.log("Beres Bos! Nggak nyampe 5 detik!");
  } else {
    Logger.log("Tidak ada data yang perlu diubah.");
  }
}