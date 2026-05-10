// // Fungsi onOpen akan dipanggil oleh trigger setiap kali spreadsheet dibuka
// function onOpen(e) {
//   SpreadsheetMenu.install();
// }

// const SpreadsheetMenu = (function() {
//   const MENU_NAME = 'Auth';
//   const ITEMS = [
//     { name: 'Sign In / Register', functionName: 'openAuthWebApp' },
//     { name: 'Izinkan Script', functionName: 'requestScriptAuthorization' },
//     { name: 'Generate _e (Admin)', functionName: 'adminGenerateHash' }
//   ];

//   function install() {
//     var ui = SpreadsheetApp.getUi();  // KINI AMAN karena dipanggil dari onOpen
//     var menu = ui.createMenu(MENU_NAME);
//     ITEMS.forEach(function(item) {
//       menu.addItem(item.name, item.functionName);
//     });
//     menu.addToUi();
//   }

//   return { install: install };
// })();

// // ⚡ Fungsi menu – HARUS GLOBAL karena dipanggil oleh UI
// function openAuthWebApp() {
//   var webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '';
//   if (!webAppUrl) {
//     SpreadsheetApp.getUi().alert('URL Web App belum diset. Hubungi admin.');
//     return;
//   }
//   var html = '<a href="' + webAppUrl + '" target="_blank">Klik di sini untuk Sign In / Register</a>';
//   var htmlOutput = HtmlService.createHtmlOutput(html)
//       .setWidth(400)
//       .setHeight(200);
//   SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sign In / Register');
// }

// function requestScriptAuthorization() {
//   try {
//     // Memicu OAuth dengan meminta token akses
//     var token = ScriptApp.getOAuthToken();
//     var email = Session.getActiveUser().getEmail();
//     SpreadsheetApp.getUi().alert('Izin berhasil! Anda login sebagai: ' + email);
//   } catch (e) {
//     SpreadsheetApp.getUi().alert('Gagal mendapatkan izin. Silakan coba lagi. Error: ' + e.message);
//   }
// }

// function adminGenerateHash() {
//   var ui = SpreadsheetApp.getUi();
//   var response = ui.prompt('Generate _e', 'Masukkan email pengguna:', ui.ButtonSet.OK_CANCEL);
//   if (response.getSelectedButton() !== ui.Button.OK) return;
//   var email = response.getResponseText().trim();
//   if (!email) return;
//   try {
//     var hash = AuthService.generateAndReturnUserHash(email);
//     ui.alert('_e untuk ' + email + ':\n\n' + hash + '\n\nSalin dan simpan di AppSheet Config atau berikan ke pengguna.');
//   } catch (err) {
//     ui.alert('Error: ' + err.message);
//   }
// }

// source/init/SpreadsheetMenu.js
//v5

// function onOpen(e) {
//   SpreadsheetMenu.install();
// }

// const SpreadsheetMenu = (function() {
//   const MENU_NAME = 'Auth';
//   const ITEMS = [
//     { name: 'Sign In / Register', functionName: 'openAuthWebApp' },
//     { name: 'Izinkan Script', functionName: 'pasangKtp' },  // <-- GANTI INI
//     { name: 'Generate _e (Admin)', functionName: 'adminGenerateHash' }
//   ];

//   function install() {
//     var ui = SpreadsheetApp.getUi();
//     var menu = ui.createMenu(MENU_NAME);
//     ITEMS.forEach(function(item) {
//       menu.addItem(item.name, item.functionName);
//     });
//     menu.addToUi();
//   }

//   return { install: install };
// })();

// function requestScriptAuthorization() {
//   try {
//     // Memicu OAuth dengan meminta token akses
//     var token = ScriptApp.getOAuthToken();
//     var email = Session.getActiveUser().getEmail();
//     SpreadsheetApp.getUi().alert('Izin berhasil! Anda login sebagai: ' + email);
//   } catch (e) {
//     SpreadsheetApp.getUi().alert('Gagal mendapatkan izin. Silakan coba lagi. Error: ' + e.message);
//   }
// }

// function openAuthWebApp() {
//   var webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '';
//   if (!webAppUrl) {
//     SpreadsheetApp.getUi().alert('URL Web App belum diset. Hubungi admin.');
//     return;
//   }
//   var html = '<a href="' + webAppUrl + '" target="_blank">Klik di sini untuk Sign In / Register</a>';
//   var htmlOutput = HtmlService.createHtmlOutput(html)
//       .setWidth(400)
//       .setHeight(200);
//   SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sign In / Register');
// }

// function pasangKtp() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet();
//   var email = Session.getEffectiveUser().getEmail(); // Ini berhasil karena dipanggil dari menu oleh user

//   // Hapus trigger lama milik user ini (hindari duplikat)
//   var triggers = ScriptApp.getUserTriggers(sheet);
//   triggers.forEach(function(t) {
//     if (t.getHandlerFunction() === 'onUserEditHandler') {
//       ScriptApp.deleteTrigger(t);
//     }
//   });

//   // Buat trigger onEdit baru milik user
//   ScriptApp.newTrigger('onUserEditHandler')
//     .forSpreadsheet(sheet)
//     .onEdit()
//     .create();

//   SpreadsheetApp.getUi().alert('Izin berhasil!', 'Sekarang setiap perubahan akan tercatat atas nama: ' + email, SpreadsheetApp.getUi().ButtonSet.OK);
// }

// function getActiveUserEmail() {
//   return Session.getActiveUser().getEmail();
// }

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
  var webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '';
  if (!webAppUrl) {
    SpreadsheetApp.getUi().alert('URL Web App belum diset. Hubungi admin.');
    return;
  }
  var html = '<a href="' + webAppUrl + '" target="_blank">Klik di sini untuk Sign In / Register</a>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200), 'Sign In / Register');
}

function pasangKtp() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var email = Session.getEffectiveUser().getEmail(); // ini berhasil karena dipanggil oleh user

  // Hapus trigger lama milik user ini (hindari duplikat)
  var triggers = ScriptApp.getUserTriggers(sheet);
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'onUserEditHandler') ScriptApp.deleteTrigger(t);
  });

  // Buat trigger onEdit baru milik user
  ScriptApp.newTrigger('onUserEditHandler')
    .forSpreadsheet(sheet)
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert('Izin berhasil!', 'Perubahan akan tercatat atas nama: ' + email, SpreadsheetApp.getUi().ButtonSet.OK);
}

function adminGenerateHash() {
  var ui = SpreadsheetApp.getUi();
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