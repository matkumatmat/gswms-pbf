// src/domain/product/BatchPhotoSync.js

class BatchPhotoSync {
  /**
   * Menyingkronkan foto dari tabel anak ke kolom JSON di tabel induk.
   */
  static syncToParent(batchId) {
    if (!batchId) return;

    // 1. Ambil semua foto terkait batchId ini dari tabel PM_BATCH_FOTO
    const fotoSs = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const fotoSheet = fotoSs.getSheetByName(AppConfig.DB_BATCH_FOTO_SHEET_NAME);
    const fotoData = fotoSheet.getDataRange().getValues();
    
    const parentIdIdx = AppConfig.DB_BATCH_FOTO_PARENT_ID_COL - 1;
    const uploadIdx = AppConfig.DB_BATCH_FOTO_UPLOAD_COL - 1;

    const collectedPhotos = [];

    // Looping tabel anak buat nyari semua foto milik batchId ini
    for (let i = 1; i < fotoData.length; i++) {
      if (fotoData[i][parentIdIdx] === batchId) {
        const rawPath = fotoData[i][uploadIdx];
        if (!rawPath) continue;

        const photoObj = this._generatePhotoObject(rawPath);
        if (photoObj) collectedPhotos.push(photoObj);
      }
    }

    // 2. Update kolom fotoUrl di tabel induk (PM_BATCH)
    this._updateParentCell(batchId, collectedPhotos);
  }

  /**
   * Helper: Mencari file di Drive dan merakit Object sesuai fotoUrlKeys
   */
  static _generatePhotoObject(rawPath) {
    const fileName = rawPath.split('/').pop();
    const files = DriveApp.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      const fileId = file.getId();
      
      return {
        idDrive: fileId,
        idUuid: AppUtils.generateUUID(),
        folderPath: rawPath,
        fileName: fileName,
        type: file.getMimeType(),
        url: `https://drive.google.com/uc?export=view&id=${fileId}`,
        base64: null
      };
    }
    return null;
  }

  /**
   * Helper: Menulis array JSON ke baris yang tepat di PM_BATCH
   */
  static _updateParentCell(batchId, photoArray) {
    const ss = SpreadsheetApp.openById(AppConfig.DB_BATCH_LOOKUP_ID);
    const sheet = ss.getSheetByName(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const idColIdx = AppConfig.DB_BATCH_LOOKUP_ID_COL - 1;
    const fotoUrlCol = AppConfig.DB_BATCH_LOOKUP_FOTO_URL_BY_COL;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIdx] === batchId) {
        sheet.getRange(i + 1, fotoUrlCol).setValue(JSON.stringify(photoArray));
        break;
      }
    }
    
    AppUtils.invalidateCache(AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
  }
}