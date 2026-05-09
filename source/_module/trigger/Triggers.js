// source/_module/trigger/Triggers.js

const Triggers = (function() {
  /**
   * Menghapus semua trigger untuk project saat ini
   */
  function removeAllTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(t) {
      ScriptApp.deleteTrigger(t);
    });
  }

  /**
   * Membuat trigger onEdit untuk spreadsheet tertentu
   * @param {string} spreadsheetId - ID spreadsheet
   * @param {string} handlerFunction - nama fungsi handler (default 'onEditHandler')
   */
  function createOnEditTrigger(spreadsheetId, handlerFunction) {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    ScriptApp.newTrigger(handlerFunction || 'onEditHandler')
      .forSpreadsheet(ss)
      .onEdit()
      .create();
  }

  /**
   * Membuat trigger onChange untuk spreadsheet tertentu
   * @param {string} spreadsheetId - ID spreadsheet
   * @param {string} handlerFunction - nama fungsi handler (default 'onChangeHandler')
   */
  function createOnChangeTrigger(spreadsheetId, handlerFunction) {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    ScriptApp.newTrigger(handlerFunction || 'onChangeHandler')
      .forSpreadsheet(ss)
      .onChange()
      .create();
  }

  /**
   * Membuat trigger waktu berdasarkan cron-style
   * @param {string} handlerFunction - nama fungsi handler
   * @param {object} schedule - { everyDays, atHour } atau { everyMinutes }
   */
  function createTimeDrivenTrigger(handlerFunction, schedule) {
    var builder = ScriptApp.newTrigger(handlerFunction).timeBased();
    if (schedule.everyDays) {
      builder.everyDays(schedule.everyDays).atHour(schedule.atHour || 2);
    } else if (schedule.everyMinutes) {
      builder.everyMinutes(schedule.everyMinutes);
    } else {
      throw new Error('Invalid schedule');
    }
    builder.create();
  }

  /**
   * Mendapatkan daftar trigger yang sudah terpasang (opsional untuk debugging)
   */
  function listTriggers() {
    return ScriptApp.getProjectTriggers().map(function(t) {
      return {
        handler: t.getHandlerFunction(),
        type: t.getEventType(),
        source: t.getTriggerSourceId ? t.getTriggerSourceId() : null
      };
    });
  }

  return {
    removeAllTriggers: removeAllTriggers,
    createOnEditTrigger: createOnEditTrigger,
    createOnChangeTrigger: createOnChangeTrigger,
    createTimeDrivenTrigger: createTimeDrivenTrigger,
    listTriggers: listTriggers
  };
})();