// src/utils/AppSheetImageHelper.js

class AppSheetImageHelper {
  /**
   * Mengubah string comma-separated dari AppSheet menjadi JSON Array of Objects
   * Sesuai dengan spesifikasi fotoUrlKeys di BatchLookupService
   */
  static processEnumListImages(cellValue) {
    if (!cellValue || typeof cellValue !== 'string') return cellValue;
    
    const trimmedValue = cellValue.trim();
    
    // Jika sudah berbentuk JSON Array, abaikan (Idempotent)
    if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
      return trimmedValue;
    }

    // AppSheet menyimpan EnumList dengan pemisah koma
    const imagePaths = trimmedValue.split(',').map(p => p.trim()).filter(p => p !== '');
    if (imagePaths.length === 0) return cellValue;

    const jsonResult = [];

    imagePaths.forEach(path => {
      // AppSheet path format: "FolderName/FileName.jpg"
      // Kita perlu ekstrak nama filenya saja untuk dicari di Drive
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      if (!fileName) return;

      try {
        // Mencari file di Google Drive berdasarkan nama file yang di-generate AppSheet
        const files = DriveApp.getFilesByName(fileName);
        
        if (files.hasNext()) {
          const file = files.next();
          const fileId = file.getId();
          
          jsonResult.push({
            idDrive: fileId,
            idUuid: AppUtils.generateUUID(),
            folderPath: path,
            fileName: fileName,
            type: file.getMimeType(),
            url: `https://drive.google.com/uc?export=view&id=${fileId}`,
            base64: null // Dikosongkan agar payload tidak membengkak
          });
        } else {
          // Jika file belum beres tersinkronisasi/tidak ketemu, buat fallback
          jsonResult.push({
            idDrive: null,
            idUuid: AppUtils.generateUUID(),
            folderPath: path,
            fileName: fileName,
            type: 'UNKNOWN',
            url: null,
            base64: null
          });
        }
      } catch (e) {
        console.error(`Gagal memproses gambar ${fileName}: ${e.toString()}`);
      }
    });

    return JSON.stringify(jsonResult);
  }
}