// src/core/AuthService.js

class AuthService {
  static _hashPassword(password) {
    const env = AppConfig.DB_ENVIRONTMENT.DB_CONFIG_SETTING;
    const raw = env.DB_SALT_1_KEY + password + env.DB_SALT_2_KEY;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return signature.map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0')).join('');
  }

  static login({ email, password }) {
    const config = AppConfig.DB_ENVIRONTMENT.DB_USER_SETTING;
    const ss = SpreadsheetApp.openById(config.DB_USER_SETTING_ID);
    const sheet = ss.getSheetByName(config.DB_USER_SETTING_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const hashedInput = this._hashPassword(password);
    
    for (let i = config.DB_USER_SETTING_START_ROW - 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[config.COLS.EMAIL_COL - 1]).trim() === email.trim() && 
          String(row[config.COLS.KEY_COL - 1]).trim() === hashedInput) {
        
        const token = AppUtils.generateUUID();
        const sessionData = { 
          email: row[config.COLS.EMAIL_COL - 1], 
          role: row[config.COLS.ACCESS_COL - 1], 
          name: row[config.COLS.USER_ID_COL - 1] 
        };
        
        CacheService.getScriptCache().put(`SESSION_${token}`, JSON.stringify(sessionData), 21600);
        GlobalLogger.log(sessionData.name, "LOGIN", "SYSTEM", "-", "-", "Success");
        return { token, user: sessionData };
      }
    }
    throw new Error("Email atau Password salah!");
  }

  static validateToken(token) {
    if (!token) return null;
    const cached = CacheService.getScriptCache().get(`SESSION_${token}`);
    return cached ? JSON.parse(cached) : null;
  }
}