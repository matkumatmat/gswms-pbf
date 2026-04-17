// src/utils/test.js

function debugCariBatch() {
  // GANTI NAMA BATCH DI SINI BUAT NGETEST (Sesuaiin sama yang lagi error)
  const targetBatch = "B20250305-2"; 
  
  Logger.log("==================================================");
  Logger.log("MULAI DEBUG PENCARIAN BATCH: [" + targetBatch + "]");
  Logger.log("==================================================");

  const targetLower = targetBatch.trim().toLowerCase();

  // 1. CEK HOT STORAGE (2026)
  Logger.log("\n>>> CEK HOT STORAGE (TAHUN BERJALAN) <<<");
  const hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
  if (!hotConfig) {
    Logger.log("❌ FATAL: AppConfig.DB_DISTRIBUSI_CURRENT tidak terdefinisi!");
  } else {
    // Normalisasi struktur object biar gampang dibaca fungsi
    const configHotObj = {
      id: hotConfig.DB_DISTRIBUSI_CURRENT_ID,
      sheetName: hotConfig.DB_DISTRIBUSI_CURRENT_SHEET_NAME,
      tableName: hotConfig.DB_DISTRIBUSI_CURRENT_TABLE_NAME,
      startRow: hotConfig.DB_DISTRIBUSI_CURRENT_START_ROW,
      mapper: hotConfig.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER,
      year: hotConfig.DB_DISTRIBUSI_CURRENT_YEAR
    };
    jalaninInvestigasi(configHotObj, targetLower);
  }

  // 2. CEK COLD STORAGE (2025 dkk)
  Logger.log("\n>>> CEK COLD STORAGE (TAHUN LALU) <<<");
  const coldConfigs = AppConfig.DB_DISTRIBUSI_COLD;
  if (!coldConfigs || !Array.isArray(coldConfigs)) {
    Logger.log("❌ FATAL: AppConfig.DB_DISTRIBUSI_COLD rusak atau bukan array!");
  } else {
    coldConfigs.forEach(c => {
      if (c.DB_DISTRIBUSI_ID && c.DB_DISTRIBUSI_ID !== 'NOT_SET_YET') {
        Logger.log("\n--- Cek Tahun: " + c.DB_DISTRIBUSI_YEAR + " ---");
        const configColdObj = {
          id: c.DB_DISTRIBUSI_ID,
          sheetName: c.DB_DISTRIBUSI_SHEET_NAME,
          tableName: c.DB_DISTRIBUSI_TABLE_NAME,
          startRow: c.DB_DISTRIBUSI_START_ROW,
          mapper: c.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER,
          year: c.DB_DISTRIBUSI_YEAR
        };
        jalaninInvestigasi(configColdObj, targetLower);
      }
    });
  }
}

function jalaninInvestigasi(conf, targetBatch) {
  try {
    Logger.log("1. Buka Spreadsheet ID: " + conf.id);
    const ss = SpreadsheetApp.openById(conf.id);

    Logger.log("2. Nyari Sheet: '" + conf.sheetName + "' atau '" + conf.tableName + "'");
    let sheet = ss.getSheetByName(conf.sheetName);
    
    if (!sheet) {
      Logger.log("⚠️ GAGAL! Nyoba pake fallback nama tabel: '" + conf.tableName + "'");
      sheet = ss.getSheetByName(conf.tableName);
    }

    if (!sheet) {
      Logger.log("❌ FATAL: Sheet tetep ga ketemu bos! Berarti nama sheet di file ini bener-bener beda.");
      return;
    }
    
    Logger.log("✅ Sheet berhasil dibuka: " + sheet.getName());

    const lastRow = sheet.getLastRow();
    Logger.log("3. Total baris yang ada isinya: " + lastRow);

    if (lastRow < conf.startRow) {
      Logger.log("⚠️ Data kosong melompong, cuma ada header.");
      return;
    }

    const map = conf.mapper;
    const batchColIndex = map.batch - 1; // Index array
    
    Logger.log("4. Aturan Kolom: Batch di Kolom ke-" + map.batch + " (Index Array: " + batchColIndex + ")");

    const rawData = sheet.getRange(conf.startRow, 1, lastRow - conf.startRow + 1, sheet.getLastColumn()).getValues();
    Logger.log("✅ Berhasil narik " + rawData.length + " baris data ke RAM.");

    let foundCount = 0;
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rawBatchValue = row[batchColIndex];
      const currentBatch = String(rawBatchValue || '').trim().toLowerCase();

      // Cek kalo ada yang "hampir mirip" (Spasi gaib, typo, huruf kecil/gede)
      if (currentBatch.includes(targetBatch) || targetBatch.includes(currentBatch)) {
         if (currentBatch !== targetBatch && currentBatch.length > 0) {
            Logger.log(`⚠️ MENCURIGAKAN di Baris ${i + conf.startRow}: Asli='${rawBatchValue}' -> Dibaca='${currentBatch}'`);
         }
      }

      // Cek Match Sempurna
      if (currentBatch === targetBatch) {
        foundCount++;
        Logger.log(`🎯 KETEMU MATCH! Di baris ${i + conf.startRow}. IN: ${row[map.penerimaan-1]} | OUT: ${row[map.distribusi-1]} | Konsumen: ${row[map.namaKonsumen-1]}`);
      }
    }

    Logger.log("🏁 TOTAL MATCH DI TAHUN " + conf.year + ": " + foundCount + " baris mutasi.");

  } catch (e) {
    Logger.log("❌ ERROR EXCEPTION MUNCUL: " + e.message);
  }
}