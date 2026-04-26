// src/core/AuthService.js

class AuthService {
  static _hashPassword(password) {
    const salt1 = AppConfig.DB_ENVIRONTMENT.DB_CONFIG_SETTING.DB_SALT_1_KEY;
    const salt2 = AppConfig.DB_ENVIRONTMENT.DB_CONFIG_SETTING.DB_SALT_2_KEY;
    const raw = salt1 + password + salt2;
    
    // Bikin hash SHA-256 (Native Google Apps Script)
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return signature.map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0')).join('');
  }

  static login({ email, password }) {
    const config = AppConfig.DB_ENVIRONTMENT.DB_USER_SETTING;
    const ss = SpreadsheetApp.openById(config.DB_USER_SETTING_ID);
    const sheet = ss.getSheetByName(config.DB_USER_SETTING_SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    const hashedInput = this._hashPassword(password);
    
    // Cari user (mulai dari baris setelah header)
    for (let i = config.DB_USER_SETTING_START_ROW - 1; i < data.length; i++) {
      const row = data[i];
      const dbEmail = String(row[config.COLS.EMAIL_COL - 1]).trim();
      const dbPass = String(row[config.COLS.KEY_COL - 1]).trim();
      const dbRole = String(row[config.COLS.ACCESS_COL - 1]).trim().toUpperCase();
      const dbName = String(row[config.COLS.USER_ID_COL - 1]).trim();
      
      if (dbEmail === email.trim() && dbPass === hashedInput) {
        // LOGIN SUKSES! Generate Token 12 Jam
        const token = AppUtils.generateUUID();
        const sessionData = { email: dbEmail, role: dbRole, name: dbName };
        
        // Simpan ke CacheService (Memori Server Google) selama 12 jam (43200 detik)
        const cache = CacheService.getScriptCache();
        cache.put(`SESSION_${token}`, JSON.stringify(sessionData), 21600); // Max cache GAS biasanya 6 jam, kita set 6 jam dulu aman
        
        // Catat ke Global Log
        GlobalLogger.log(dbName, "LOGIN", "SYSTEM", "-", "-", "Success");
        
        return { token, user: sessionData };
      }
    }
    throw new Error("Kredensial tidak valid! Cek email & password.");
  }

  static validateToken(token) {
    if (!token) return null;
    const cache = CacheService.getScriptCache();
    const sessionData = cache.get(`SESSION_${token}`);
    return sessionData ? JSON.parse(sessionData) : null;
  }
}