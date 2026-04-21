// src/core/CronJobs.js

/**
 * FUNGSI INTI UNTUK MENGHITUNG DAN UPDATE RSL
 * Bisa dipanggil manual buat testing, atau dipanggil cron tiap malem.
 */
function processUpdateSemuaRSL() {
  const sheetName = AppConfig.DB_BATCH_LOOKUP_SHEET_NAME || 'PM_BATCH';
  const spreadsheetId = AppConfig.DB_BATCH_LOOKUP_ID || '1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o';
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    console.error("Woy! Sheet " + sheetName + " kaga nemu bos!");
    return;
  }

  const startRow = 2;
  const numRows = sheet.getLastRow() - 1;
  if (numRows <= 0) return; 
  
  const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();
  
  const arrayRslBulan = [];
  const arrayRslHari = [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  let barisValid = 0; // Buat ngitung jumlah baris yang beneran ada isinya

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const idBatch = String(row[0] || '').trim(); // Cek Kolom A (ID)
    
    // REM OTOMATIS: Kalo ID-nya kosong, berarti udah masuk baris kosong. Langsung STOP!
    if (idBatch === '') break;

    const expValue = row[8]; // Kolom Expiry Date
    let sisaHari = "";
    let sisaBulan = "";
    
    if (expValue) {
      let expDate = new Date(expValue);
      if (!isNaN(expDate.getTime())) {
        const diffTime = expDate - today;
        sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (sisaHari < 0) {
          sisaBulan = 0.0;
        } else {
          // Pake parseFloat biar jadi angka murni desimal (contoh: 1.5)
          sisaBulan = parseFloat((sisaHari / 30.44).toFixed(1)); 
        }
      }
    }
    
    arrayRslBulan.push([sisaBulan]);
    arrayRslHari.push([sisaHari]);
    barisValid++;
  }
  
  // TEMBAK BALIK KE SPREADSHEET (Hanya sepanjang baris yang valid aja)
  if (barisValid > 0) {
    const rangeBulan = sheet.getRange(startRow, 11, barisValid, 1);
    const rangeHari = sheet.getRange(startRow, 20, barisValid, 1);

    rangeBulan.setValues(arrayRslBulan);
    rangeHari.setValues(arrayRslHari);

    // THE FIX: PAKSA FORMATNYA JADI ANGKA (Biar ga sok pinter jadi ddmmyyyy)
    rangeBulan.setNumberFormat("0.0"); // Maksa jadi 1 angka di belakang koma
    rangeHari.setNumberFormat("0");    // Maksa jadi bilangan bulat
  }
  
  console.log(`✅ MANTEP BOS! Berhasil update RSL HANYA untuk ${barisValid} baris data asli.`);
}


// =====================================================================
// INIT MANUAL (BUAT LU TES SEKARANG)
// =====================================================================
function initTesUpdateRSL() {
  console.log("Memulai eksekusi update RSL manual...");
  processUpdateSemuaRSL();
  console.log("Selesai bosku! Cek spreadsheet PM_BATCH lu sekarang!");
}


// =====================================================================
// UPDATE CRON JOB HARIAN KITA
// =====================================================================
// Kita barengin aja sama cron job Sinkronisasi Stok lu kemaren.
// Jalan jam 1 Pagi itu udah paling perfect karena perpindahan hari udah selesai.

function scheduledDailyStockSync() {
  try {
    console.log("=== MEMULAI CRON JOB HARIAN ===");
    
    // 1. Sinkronisasi Stok (In/Out)
    console.log("1. Menjalankan Aggregator Stok...");
    const aggregatorService = new StockAggregatorService();
    aggregatorService.executeDailySync(); // Asumsi ini fungsi lu yg kemarin
    
    // 2. Update Umur Simpan (RSL)
    console.log("2. Menghitung Ulang RSL Batch...");
    processUpdateSemuaRSL();
    
    console.log("=== CRON JOB HARIAN SELESAI ===");
  } catch (error) {
    console.error("Cron Job Failed: " + error.toString());
  }
}