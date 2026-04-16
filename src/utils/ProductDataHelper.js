// src/utils/ProductDataHelper.js

class ProductDataHelper {
  /**
   * Mengubah input manual "p;l;t" (e.g. 10;20;30) menjadi JSON String
   */
  static formatPltToJson(rawValue) {
    if (!rawValue || typeof rawValue !== 'string') return rawValue;

    // Cek apakah mengandung pemisah semicolon (;)
    if (rawValue.includes(';')) {
      const parts = rawValue.split(';').map(v => parseFloat(v.trim()));
      
      if (parts.length === 3) {
        const pltObj = {
          p: parts[0] || 0,
          l: parts[1] || 0,
          t: parts[2] || 0
        };
        return JSON.stringify(pltObj);
      }
    }
    return rawValue; // Kembalikan nilai asli jika tidak sesuai format
  }

  /**
   * Menghasilkan URL Info otomatis dengan parameter ID atau Kode Barang
   */
  static generateInfoUrl(existingValue, rowData) {
    const id = rowData.id;
    const batch = rowData.batch;

    // Jika kolom masih kosong atau belum ada link GAS kita
    if (!existingValue || existingValue === "" || !existingValue.includes('script.google.com')) {
      // Format URL GAS: .../dev?page=detail&id=UUID&batch=NAMA_BATCH
      return `${AppConfig.WEB_APP_URL}?page=detail&id=${id}&batch=${encodeURIComponent(batch)}`;
    }
    
    return existingValue; // Kalau udah bener, diemin aja
  }
}