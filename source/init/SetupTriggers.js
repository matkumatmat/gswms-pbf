// source/init/SetupTriggers.js

function setupAllTriggers() {
  // Hapus semua trigger yang ada
  Triggers.removeAllTriggers();
  
  // Dapatkan semua konfigurasi trigger dari registry
  var allTriggers = TriggerRegistry.getAllTriggers();
  
  allTriggers.forEach(function(triggerConfig) {
    var ssId = triggerConfig.spreadsheetId;
    try {
      // Pasang onEdit trigger
      Triggers.createOnEditTrigger(ssId, triggerConfig.onEditHandler || 'onEditHandler');
      // Pasang onChange trigger
      Triggers.createOnChangeTrigger(ssId, triggerConfig.onChangeHandler || 'onChangeHandler');
      Logger.log('Trigger terpasang untuk spreadsheet: ' + ssId);
    } catch(e) {
      Logger.log('Gagal pasang trigger untuk ' + ssId + ': ' + e.message);
    }
  });
  
  // Pasang trigger waktu untuk daily sync (jam 2 pagi)
  Triggers.createTimeDrivenTrigger('scheduledDailyStockSync', { everyDays: 1, atHour: 2 });
  
  Logger.log('Semua trigger telah dipasang.');
}