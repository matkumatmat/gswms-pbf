
// function onOpen(e) { SpreadsheetMenu.install(); }

// const SpreadsheetMenu = (function() {
//   const MENU_NAME = 'Auth';
//   const ITEMS = [
//     { name: 'Sign In / Register', functionName: 'openAuthWebApp' },
//     { name: 'Izinkan Script', functionName: 'pasangKtp' },
//     { name: 'Generate _e (Admin)', functionName: 'adminGenerateHash' }
//   ];

//   function install() {
//     var ui = SpreadsheetApp.getUi();
//     var menu = ui.createMenu(MENU_NAME);
//     ITEMS.forEach(function(item) { menu.addItem(item.name, item.functionName); });
//     menu.addToUi();
//   }

//   return { install: install };
// })();

// function openAuthWebApp() {
//   var webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '';
//   if (!webAppUrl) {
//     SpreadsheetApp.getUi().alert('URL Web App belum diset. Hubungi admin.');
//     return;
//   }
//   var html = '<a href="' + webAppUrl + '" target="_blank">Klik di sini untuk Sign In / Register</a>';
//   SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200), 'Sign In / Register');
// }

// function pasangKtp() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet();
//   var email = Session.getEffectiveUser().getEmail(); // ini berhasil karena dipanggil oleh user

//   // Hapus trigger lama milik user ini (hindari duplikat)
//   var triggers = ScriptApp.getUserTriggers(sheet);
//   triggers.forEach(function(t) {
//     if (t.getHandlerFunction() === 'onUserEditHandler') ScriptApp.deleteTrigger(t);
//   });

//   // Buat trigger onEdit baru milik user
//   ScriptApp.newTrigger('onUserEditHandler')
//     .forSpreadsheet(sheet)
//     .onEdit()
//     .create();

//   SpreadsheetApp.getUi().alert('Izin berhasil!', 'Perubahan akan tercatat atas nama: ' + email, SpreadsheetApp.getUi().ButtonSet.OK);
// }

// function adminGenerateHash() {
//   var ui = SpreadsheetApp.getUi();
//   var response = ui.prompt('Generate _e', 'Masukkan email pengguna:', ui.ButtonSet.OK_CANCEL);
//   if (response.getSelectedButton() !== ui.Button.OK) return;
//   var email = response.getResponseText().trim();
//   if (!email) return;
//   try {
//     var hash = AuthService.generateAndReturnUserHash(email);
//     ui.alert('_e untuk ' + email + ':\n\n' + hash + '\n\nSalin dan simpan di AppSheet Config.');
//   } catch (err) {
//     ui.alert('Error: ' + err.message);
//   }
// }

// source/init/SpreadsheetMenu.js

function onOpen(e) { SpreadsheetMenu.install(); }

const SpreadsheetMenu = (function() {
  const MENU_NAME = 'Auth';
  const ITEMS = [
    { name: 'Sign In / Register', functionName: 'openAuthWebApp' },
    { name: 'Izinkan Script', functionName: 'pasangKtp' },
    { name: 'Generate _e (Admin)', functionName: 'adminGenerateHash' }
  ];

  function install() {
    var ui = SpreadsheetApp.getUi();
    var menu = ui.createMenu(MENU_NAME);
    ITEMS.forEach(function(item) { menu.addItem(item.name, item.functionName); });
    menu.addToUi();
  }

  return { install: install };
})();

function openAuthWebApp() {
  var webAppUrl = ApplicationConfig.app.webAppUrl;  // langsung dari AppConfig

  if (!webAppUrl) {
    SpreadsheetApp.getUi().alert('URL Web App belum diatur di AppConfig.js');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();
  var url = webAppUrl + '?sheetId=' + ssId;
  var html = '<a href="' + url + '" target="_blank">Klik di sini untuk Sign In / Register</a>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200), 'Sign In / Register');
}

/**
 * Menu "Izinkan Script" – memicu OAuth + memasang trigger audit.
 */
// function pasangKtp() {
//   var ss = SpreadsheetApp.getActiveSpreadsheet();
//   var ui = SpreadsheetApp.getUi();
//   var email;

//   // Step 1: Paksa OAuth jika belum authorized
//   var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
//   if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
//     ui.alert(
//       'Izin Diperlukan',
//       'Script ini memerlukan izin untuk melihat email Anda.\n' +
//       'Setelah Anda klik OK, jendela OAuth akan muncul.\n' +
//       'Silakan klik "Izinkan" atau "Allow" pada pop-up Google.',
//       ui.ButtonSet.OK
//     );
//   }

//   // Step 2: Coba dapatkan email (akan memicu OAuth jika belum)
//   try {
//     email = Session.getActiveUser().getEmail();
//   } catch(e) {
//     ui.alert('Gagal mendapatkan izin: ' + e.message + '\n\nSilakan refresh halaman dan coba lagi.');
//     return;
//   }

//   if (!email) {
//     ui.alert('Tidak dapat mendeteksi email Anda. Pastikan Anda sudah login ke akun Google.');
//     return;
//   }

//   // Step 3: Hapus trigger lama milik user ini
//   var triggers = ScriptApp.getUserTriggers(ss);
//   triggers.forEach(function(t) {
//     if (t.getHandlerFunction() === 'onUserEditHandler') {
//       ScriptApp.deleteTrigger(t);
//     }
//   });

//   // Step 4: Buat trigger onEdit baru milik user
//   ScriptApp.newTrigger('onUserEditHandler')
//     .forSpreadsheet(ss)
//     .onEdit()
//     .create();

//   ui.alert('✅ Izin Berhasil!', 'Setiap perubahan Anda di spreadsheet ini akan tercatat atas nama:\n\n' + email, ui.ButtonSet.OK);
//   Logger.log('✅ Trigger onUserEditHandler terpasang untuk ' + email);
// }

function pasangKtp() {
  var ui = SpreadsheetApp.getUi();
  var email;

  // Step 1: Paksa OAuth + ambil email
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    ui.alert('Izin Diperlukan',
      'Script ini memerlukan izin untuk melihat email Anda.\n' +
      'Setelah klik OK, jendela OAuth akan muncul.',
      ui.ButtonSet.OK
    );
  }

  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    ui.alert('Gagal mendapatkan izin: ' + e.message + '\n\nCoba refresh dan ulangi.');
    return;
  }

  if (!email) {
    ui.alert('Tidak dapat mendeteksi email Anda. Pastikan sudah login ke Google.');
    return;
  }

  // Step 2: Install trigger di SEMUA spreadsheet yang terdaftar di TriggerRegistry
  var allTriggers = TriggerRegistry.getAllTriggers();
  var seenSs = {};
  var successCount = 0;
  var failLog = [];

  allTriggers.forEach(function(t) {
    if (seenSs[t.spreadsheetId]) return;
    seenSs[t.spreadsheetId] = true;

    try {
      var ss = SpreadsheetApp.openById(t.spreadsheetId);

      // Hapus trigger lama milik user ini untuk spreadsheet ini (hindari duplikat)
      var userTriggers = ScriptApp.getUserTriggers(ss);
      userTriggers.forEach(function(ut) {
        if (ut.getHandlerFunction() === 'onUserEditHandler') {
          ScriptApp.deleteTrigger(ut);
        }
      });

      // Pasang trigger baru milik user ini
      ScriptApp.newTrigger('onUserEditHandler')
        .forSpreadsheet(ss)
        .onEdit()
        .create();

      successCount++;
      Logger.log('✅ Trigger pasang: ' + t.spreadsheetId + ' untuk ' + email);
    } catch (e) {
      failLog.push(t.spreadsheetId + ': ' + e.message);
      Logger.log('❌ Gagal pasang trigger: ' + t.spreadsheetId + ' - ' + e.message);
    }
  });

  // Step 3: Feedback ke user
  var msg = 'Perubahan Anda di ' + successCount + ' spreadsheet akan tercatat atas nama:\n\n' + email;
  if (failLog.length > 0) {
    msg += '\n\n⚠ Gagal di ' + failLog.length + ' spreadsheet (lihat log).';
  }
  ui.alert('✅ Izin Berhasil!', msg, ui.ButtonSet.OK);
}


function requestScriptAuthorization() {
  try {
    // Memicu OAuth dengan meminta token akses
    var token = ScriptApp.getOAuthToken();
    var email = Session.getActiveUser().getEmail();
    SpreadsheetApp.getUi().alert('Izin berhasil! Anda login sebagai: ' + email);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Gagal mendapatkan izin. Silakan coba lagi. Error: ' + e.message);
  }
}

/**
 * Hanya admin yang boleh generate _e.
 */
function adminGenerateHash() {
  var ui = SpreadsheetApp.getUi();
  // Cek apakah user saat ini adalah admin (hardcode email admin)
  var currentUserEmail;
  try {
    currentUserEmail = Session.getActiveUser().getEmail();
  } catch(e) {
    ui.alert('Anda harus memberikan izin script terlebih dahulu.\nGunakan menu "Izinkan Script".');
    return;
  }
  
  // Daftar admin yang diizinkan
  var adminEmails = ['admin@pbf.com', 'biofarmapbf@gmail.com'];
  if (adminEmails.indexOf(currentUserEmail) === -1) {
    ui.alert('Akses Ditolak', 'Hanya admin yang dapat menggunakan fitur ini.', ui.ButtonSet.OK);
    return;
  }

  var response = ui.prompt('Generate _e', 'Masukkan email pengguna:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var email = response.getResponseText().trim();
  if (!email) return;
  try {
    var hash = AuthService.generateAndReturnUserHash(email);
    ui.alert('_e untuk ' + email + ':\n\n' + hash + '\n\nSalin dan simpan di AppSheet Config.');
  } catch (err) {
    ui.alert('Error: ' + err.message);
  }
}