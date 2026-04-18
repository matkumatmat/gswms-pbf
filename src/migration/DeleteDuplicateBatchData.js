function helperCleanDuplicateBatchLama() {
  // THE FIX: Tembak ID Spreadsheet langsung biar ga error "null" pas di-run
  const spreadsheetId = '1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o'; 
  const ss = SpreadsheetApp.openById(spreadsheetId);
  
  // 1. Baca Sheet 'list_duplikat' (JANGAN DIGANTI JADI APPCONFIG LAGI WKWK)
  const sheetDuplikat = ss.getSheetByName('list_duplikat');
  if (!sheetDuplikat) {
    Logger.log("Error: Sheet 'list_duplikat' ngga ketemu bos! Pastiin huruf kecil semua sesuai nama tabnya.");
    return;
  }
  
  const dataDuplikat = sheetDuplikat.getDataRange().getValues();
  const setDuplikat = new Set();
  
  // Asumsi list batch duplikat ditaro di Kolom A (Index 0)
  dataDuplikat.forEach(row => {
    const batch = String(row[0]).trim();
    if (batch) setDuplikat.add(batch);
  });
  
  // 2. Eksekusi Hapus di 'PM_BATCH'
  const sheetBatch = ss.getSheetByName('PM_BATCH');
  if (!sheetBatch) {
    Logger.log("Error: Sheet 'PM_BATCH' ngga ada!");
    return;
  }
  
  const dataBatch = sheetBatch.getDataRange().getValues();
  let deletedCount = 0;
  
  // LOOPING MUNDUR dari baris paling bawah sampai baris 2 (skip header)
  for (let i = dataBatch.length - 1; i >= 1; i--) { 
    const row = dataBatch[i];
    
    // Index Array 0-based: C=2, D=3, G=6
    const alokasi = String(row[2] || '').trim(); // Kolom C (Alokasi)
    const sektor = String(row[3] || '').trim();  // Kolom D (Sektor)
    const batchNo = String(row[6] || '').trim(); // Kolom G (Batch)
    
    // Cek apakah batch ada di list duplikat
    if (setDuplikat.has(batchNo)) {
      // Cek apakah Alokasi ATAU Sektor TIDAK kosong
      // (Artinya ini data barang lama yang udah diset alokasi/sektornya)
      if (alokasi !== "" || sektor !== "") {
        sheetBatch.deleteRow(i + 1); // +1 karena Array mulai dari 0, Row Sheet mulai dari 1
        deletedCount++;
        Logger.log(`Tebas Baris ${i + 1}: Batch ${batchNo} (Alokasi: ${alokasi}, Sektor: ${sektor})`);
      }
    }
  }
  
  // Kasih log hasil akhir (Ga pake UI Alert biar ga error)
  Logger.log(`🧹 Eksekusi Selesai Bos! Total baris barang lama yang dibersihkan: ${deletedCount} baris.`);
}