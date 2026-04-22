function fixMissingProductIdInBatch() {
  // 1. TEMBAK LANGSUNG KE MASTER DB PAKE APPCONFIG!
  const ssMaster = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
  const sheetBatch = ssMaster.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
  const sheetProduct = ssMaster.getSheetByName(AppConfig.DB_PRODUCT_LOOKUP_SHEET_NAME);

  if (!sheetBatch || !sheetProduct) {
    console.error("Waduh, Sheet PM_BATCH atau PM_PRODUCT ga ketemu di Master DB!");
    return;
  }

  const batchData = sheetBatch.getDataRange().getValues();
  const productData = sheetProduct.getDataRange().getValues();
  
  // 2. MAPPING KOLOM PRODUCT DARI APPCONFIG
  const colProdId = AppConfig.DB_PRODUCT_LOOKUP_ID_COL - 1;
  const colProdOld = AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_OLD_COL - 1;
  const colProdNew = AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_NEW_COL - 1;
  const colProdNama = AppConfig.DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL - 1;
  const colProdNamaErp = AppConfig.DB_PRODUCT_LOOKUP_NAMA_BARANG_ERP_COL - 1;
  const colProdUpdAt = AppConfig.DB_PRODUCT_LOOKUP_UPDATED_AT_COL - 1;
  const colProdUpdBy = AppConfig.DB_PRODUCT_LOOKUP_UPDATED_BY_COL - 1;

  // Bangun Radar Produk
  const productMap = new Map();
  for (let i = 1; i < productData.length; i++) {
    const id = String(productData[i][colProdId] || '').trim(); 
    if (!id) continue;
    
    const kodeOld = String(productData[i][colProdOld] || '').trim().toLowerCase(); 
    const kodeNew = String(productData[i][colProdNew] || '').trim().toLowerCase(); 
    const nama = String(productData[i][colProdNama] || '').trim().toLowerCase();    
    
    if (kodeOld) productMap.set(kodeOld, id);
    if (kodeNew) productMap.set(kodeNew, id);
    if (nama) productMap.set(nama, id);
  }

  const audit = AppUtils.getAuditTrail();
  const newProductsToAppend = [];
  const batchUpdates = []; 
  
  let countLinkedExisting = 0;
  let countCreatedNew = 0;

  // 3. MAPPING KOLOM BATCH
  const colBatchProdId = AppConfig.DB_BATCH_LOOKUP_PRODUCT_ID_COL - 1;
  const colBatchKode = 4; // Asumsi Kolom E
  const colBatchNama = 5; // Asumsi Kolom F

  // MULAI SIDAK BATCH
  for (let i = 1; i < batchData.length; i++) {
    const pId = String(batchData[i][colBatchProdId] || '').trim();
    
    if (!pId) { // Jika Product ID kosong
      const kodeBarang = String(batchData[i][colBatchKode] || '').trim();
      const namaDagang = String(batchData[i][colBatchNama] || '').trim();
      
      if (!kodeBarang && !namaDagang) continue; 
      
      const searchKode = kodeBarang.toLowerCase();
      const searchNama = namaDagang.toLowerCase();
      
      let foundId = null;
      
      if (searchKode && productMap.has(searchKode)) {
        foundId = productMap.get(searchKode);
      } else if (searchNama && productMap.has(searchNama)) {
        foundId = productMap.get(searchNama);
      }
      
      if (foundId) {
        batchUpdates.push({ row: i + 1, val: foundId });
        countLinkedExisting++;
      } else {
        const newId = AppUtils.generateUUID();
        
        const newProdRow = new Array(12).fill("");
        newProdRow[colProdId] = newId;                       
        newProdRow[colProdOld] = "'" + kodeBarang;          
        newProdRow[colProdNew] = "-";                         
        newProdRow[colProdNama] = namaDagang;                  
        newProdRow[colProdNamaErp] = namaDagang;                  
        newProdRow[colProdUpdAt] = audit.updatedAt;            
        newProdRow[colProdUpdBy] = audit.updatedBy;            

        newProductsToAppend.push(newProdRow);
        batchUpdates.push({ row: i + 1, val: newId });
        
        if (searchKode) productMap.set(searchKode, newId);
        if (searchNama) productMap.set(searchNama, newId);
        
        countCreatedNew++;
      }
    }
  }

  // 4. EKSEKUSI PENYIMPANAN
  if (newProductsToAppend.length > 0) {
    sheetProduct.getRange(sheetProduct.getLastRow() + 1, 1, newProductsToAppend.length, 12).setValues(newProductsToAppend);
  }

  if (batchUpdates.length > 0) {
    const fullColB = sheetBatch.getRange(1, AppConfig.DB_BATCH_LOOKUP_PRODUCT_ID_COL, batchData.length, 1).getValues();
    batchUpdates.forEach(u => {
      fullColB[u.row - 1][0] = u.val;
    });
    sheetBatch.getRange(1, AppConfig.DB_BATCH_LOOKUP_PRODUCT_ID_COL, fullColB.length, 1).setValues(fullColB);
  }

  // GANTI ALERT JADI CONSOLE.LOG
  console.log(`🔥 Beres Bos! (Powered by AppConfig)
- ${countLinkedExisting} Batch berhasil disambungin ke Produk yg udah ada.
- ${countCreatedNew} Produk Beneran BARU berhasil ditambahin ke PM_PRODUCT.`);
}