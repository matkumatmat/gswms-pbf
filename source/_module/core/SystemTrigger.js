// source/_module/core/SystemTrigger.js

var SystemTrigger = (function() {
  function runAudit(sheet, rowNum, userEmail) {
    var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(sheet.getParent().getId(), sheet.getName());
    if (!triggerInfo) return;

    var audit = AuditUtils.getAuditTrail(userEmail);
    var headerValues = sheet.getRange(triggerInfo.headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colUpdatedAt = -1, colUpdatedBy = -1;
    for (var c = 0; c < headerValues.length; c++) {
      if (headerValues[c] === 'UPDATED AT' || headerValues[c] === 'updatedAt') colUpdatedAt = c + 1;
      if (headerValues[c] === 'UPDATED BY' || headerValues[c] === 'updatedBy') colUpdatedBy = c + 1;
    }
    if (colUpdatedAt !== -1) sheet.getRange(rowNum, colUpdatedAt).setValue(audit.updatedAt);
    if (colUpdatedBy !== -1) sheet.getRange(rowNum, colUpdatedBy).setValue(audit.updatedBy);
  }
  return { runAudit: runAudit };
})();