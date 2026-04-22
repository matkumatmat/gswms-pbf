// src/helper/FindDuplicateProducts.js

function radarDuplicateProducts() {
  Logger.log("Mulai memindai duplikasi di PM_PRODUCT...");

  const ss = SpreadsheetApp.openById(AppConfig.DB_PRODUCT_LOOKUP_ID);
  const sheet = ss.getSheetByName(AppConfig.DB_PRODUCT_LOOKUP_SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  // Index sesuai dengan ProductRepo.TABLE_KEYS lu
  // 0: id, 1: kodeBarang (Old), 2: kodeBarangNew, 3: namaDagang
  const idIdx = 0;
  const oldCodeIdx = 1;
  const newCodeIdx = 2;
  const nameIdx = 3;

  const mapByName = {};
  const mapByOldCode = {};
  const mapByNewCode = {};

  // Mulai dari baris ke-2 (index 1) untuk skip header
  for (let i = 1; i < data.length; i++) { 
    const row = data[i];
    const id = String(row[idIdx] || '').trim();
    
    // Kalau baris benar-benar kosong, skip
    if (!row.join('').trim()) continue;

    const oldCode = String(row[oldCodeIdx] || '').trim();
    const newCode = String(row[newCodeIdx] || '').trim();
    const name = String(row[nameIdx] || '').trim();

    // 1. Group by Nama Dagang (Paling sering kejadian)
    if (name && name !== '-') {
      const keyName = name.toLowerCase();
      if (!mapByName[keyName]) mapByName[keyName] = [];
      mapByName[keyName].push({ row: i + 1, id, oldCode, newCode, name });
    }

    // 2. Group by Kode Lama
    if (oldCode && oldCode !== '-') {
      const keyOld = oldCode.toLowerCase();
      if (!mapByOldCode[keyOld]) mapByOldCode[keyOld] = [];
      mapByOldCode[keyOld].push({ row: i + 1, id, oldCode, newCode, name });
    }

    // 3. Group by Kode Baru
    if (newCode && newCode !== '-') {
      const keyNew = newCode.toLowerCase();
      if (!mapByNewCode[keyNew]) mapByNewCode[keyNew] = [];
      mapByNewCode[keyNew].push({ row: i + 1, id, oldCode, newCode, name });
    }
  }

  // --- HELPER UNTUK NGERAPIHIN OUTPUT ---
  function extractDuplicates(mapData, categoryName) {
    let results = [];
    for (let key in mapData) {
      if (mapData[key].length > 1) { // Hanya ambil yang lebih dari 1 (Duplikat)
        results.push(`\n[ DUPLIKAT BERDASARKAN ${categoryName}: "${key.toUpperCase()}" ]`);
        mapData[key].forEach(item => {
          results.push(`-> Row ${String(item.row).padEnd(4)} | Old: ${item.oldCode.padEnd(15)} | New: ${item.newCode.padEnd(15)} | Nama: ${item.name} | ID: ${item.id}`);
        });
      }
    }
    return results;
  }

  let report = [];
  report.push("========== LAPORAN FORENSIK PM_PRODUCT ==========");
  
  let dupNames = extractDuplicates(mapByName, "NAMA DAGANG");
  let dupOldCodes = extractDuplicates(mapByOldCode, "KODE LAMA");
  let dupNewCodes = extractDuplicates(mapByNewCode, "KODE BARU");

  if (dupNames.length > 0) report = report.concat(dupNames);
  if (dupOldCodes.length > 0) report = report.concat(dupOldCodes);
  if (dupNewCodes.length > 0) report = report.concat(dupNewCodes);

  if (report.length === 1) {
    Logger.log("🔥 AMAN BOS! Tidak ditemukan duplikasi di PM_PRODUCT.");
  } else {
    Logger.log(report.join("\n"));
    Logger.log("\n=================================================");
    Logger.log("Silakan COPY log di atas dan paste ke gue biar kita analisa bareng mana yang mau didelete/dimerge!");
  }
}