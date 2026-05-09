// function setupAllTriggers() {
//   Triggers.removeAllTriggers();
//   var all = TriggerRegistry.getAllTriggers();

//   // Deduplikasi: satu spreadsheet = satu pasang trigger (edit + change)
//   var seen = {};
//   all.forEach(function(t) {
//     if (seen[t.spreadsheetId]) return;
//     seen[t.spreadsheetId] = true;
//     try {
//       Triggers.createOnEditTrigger(t.spreadsheetId, t.onEditHandler || 'onEditHandler');
//       Triggers.createOnChangeTrigger(t.spreadsheetId, t.onChangeHandler || 'onChangeHandler');
//       Logger.log('Triggered spreadsheet: ' + t.spreadsheetId);
//     } catch(e) {
//       Logger.log('FAIL: ' + t.spreadsheetId + ' - ' + e.message);
//     }
//   });

//   Triggers.createTimeDrivenTrigger('scheduledDailyStockSync', { everyDays: 1, atHour: 2 });
//   Logger.log('Semua trigger telah dipasang (deduplicated).');
// }

// source/init/SetupTriggers.js

function setupAllTriggers() {
  Triggers.removeAllTriggers();
  var all = TriggerRegistry.getAllTriggers();
  var seen = {};
  all.forEach(function(t) {
    if (seen[t.spreadsheetId]) return;
    seen[t.spreadsheetId] = true;

    // onEdit & onChange untuk cache invalidasi + audit
    try {
      Triggers.createOnEditTrigger(t.spreadsheetId, t.onEditHandler || 'onEditHandler');
      Triggers.createOnChangeTrigger(t.spreadsheetId, t.onChangeHandler || 'onChangeHandler');
      Logger.log('Triggers: ' + t.spreadsheetId);
    } catch(e) {
      Logger.log('Gagal trigger: ' + t.spreadsheetId + ' - ' + e.message);
    }

    // onOpen untuk menu Auth
    try {
      var ss = SpreadsheetApp.openById(t.spreadsheetId);
      ScriptApp.newTrigger('onOpen')
          .forSpreadsheet(ss)
          .onOpen()
          .create();
      Logger.log('onOpen terpasang: ' + t.spreadsheetId);
    } catch(e) {
      Logger.log('Gagal onOpen: ' + t.spreadsheetId + ' - ' + e.message);
    }
  });

  // Time trigger
  try {
    Triggers.createTimeDrivenTrigger('scheduledDailyStockSync', { everyDays: 1, atHour: 2 });
    Logger.log('Time trigger OK');
  } catch(e) {
    Logger.log('Gagal time trigger: ' + e.message);
  }

  Logger.log('Semua trigger telah dipasang.');
}