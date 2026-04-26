function initialAdminSetup() {
  const config = AppConfig.DB_ENVIRONTMENT.DB_USER_SETTING;
  const ss = SpreadsheetApp.openById(config.DB_USER_SETTING_ID);
  const sheet = ss.getSheetByName(config.DB_USER_SETTING_SHEET_NAME);
  
  const rawPassword = "ArchLinuxDevs"; // Ganti sesuka lu
  const hashedPass = AuthService._hashPassword(rawPassword);
  
  const rowData = [];
  rowData[config.COLS.USER_UUID_ID_COL - 1] = AppUtils.generateUUID();
  rowData[config.COLS.USER_ID_COL - 1] = "250266";
  rowData[config.COLS.EMAIL_COL - 1] = "mamattewahyu@gmail.com"; // Email buat login
  rowData[config.COLS.KEY_COL - 1] = hashedPass;
  rowData[config.COLS.ACCESS_COL - 1] = "ADMIN";
  
  sheet.appendRow(rowData);
  Logger.log("Admin Berhasil Dibuat! Login: mamattewahyu@gmail.com | Pass: ArchLinuxDevs");
}