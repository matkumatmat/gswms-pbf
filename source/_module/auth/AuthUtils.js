// source/_module/auth/AuthorizationUtils.js

/**
 * Utility untuk mengecek status otorisasi Apps Script.
 * @module AuthorizationUtils
 */
const AuthorizationUtils = (function() {
  /**
   * Mengecek apakah script sudah memiliki izin OAuth dari user.
   * @returns {boolean}
   */
  function isAuthorized() {
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    return authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED;
  }

  /**
   * Menampilkan dialog untuk meminta izin jika belum authorized.
   * Harus dipanggil dari konteks menu/UI.
   */
  function requestAuthorizationIfNeeded() {
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
      // Tampilkan pop-up untuk memberikan izin
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        'Izin Diperlukan',
        'Script ini memerlukan izin untuk melihat email Anda.\n\n' +
        'Setelah Anda klik OK, jendela pop-up OAuth akan muncul.\n' +
        'Silakan klik "Izinkan" atau "Allow".',
        ui.ButtonSet.OK
      );
      // Memicu OAuth dengan memanggil metode yang memerlukan izin
      const email = Session.getActiveUser().getEmail();
      SpreadsheetApp.getActiveSpreadsheet().toast('Izin berhasil diberikan untuk: ' + email);
      return true;
    }
    return false;
  }

  return {
    isAuthorized: isAuthorized,
    requestAuthorizationIfNeeded: requestAuthorizationIfNeeded
  };
})();