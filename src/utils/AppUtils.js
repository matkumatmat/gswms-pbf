// src/utils/AppUtils.js

class AppUtils {
    static mapArrayToObject(rawData, keys) {
        return rawData.map(row => {
        let obj = {};
        keys.forEach((key, index) => {
            let value = row[index];
            if (typeof value === 'string') value = value.trim();
            obj[key] = (value !== undefined && value !== '') ? value : null;
        });
        return obj;
        });
    }

    static generateUUID() {
        return Utilities.getUuid();
    }

    static getAuditTrail() {
    let email = 'System/WebApp';
    try {
      // Kita bungkus try-catch. Kalau Google nge-blokir akses email di background,
      // script nggak akan crash, tapi otomatis pakai 'System/WebApp'
      const user = Session.getActiveUser();
      if (user && user.getEmail()) {
        email = user.getEmail();
      }
    } catch (e) {
      // Diamkan saja errornya
    }

    return {
      updatedAt: new Date(), 
      updatedBy: email
    };
  }

  static safeParseJson(value) {
    if (typeof value !== 'string') return value;
    try {
      // Hanya parse kalau ada indikasi string JSON (kurung kurawal atau siku)
      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
        return JSON.parse(value);
      }
      return value;
    } catch (e) {
      return value; // Balikin apa adanya kalau gagal parse
    }
  }

  /**
   * Helper untuk invalidasi cache secara manual
   * Digunakan saat ada penulisan data via doPost
   */
  static invalidateCache(sheetName) {
    const props = PropertiesService.getScriptProperties();
    const versionKey = `VERSION_${sheetName}`;
    props.setProperty(versionKey, Date.now().toString());
  }
}