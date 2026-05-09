// source/tests/unit/cache/TriggerAuditManualT.js

function test_ManualAuditRowAndGlobalCells() {
  var ss = SpreadsheetApp.openById('1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM');
  var sheet = ss.getSheetByName('PMS_CUSTOMER');
  var headerRow = 5;
  var dataRow = 6;

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  function findCol(name) {
    for (var c = 0; c < headers.length; c++) {
      if (headers[c] === name) return c + 1;
    }
    return -1;
  }
  var colUpdatedAt = findCol('UPDATED AT');
  var colUpdatedBy = findCol('UPDATED BY');

  // ---- 1. KOSONGKAN nilai sebelumnya ----
  sheet.getRange(dataRow, colUpdatedAt).setValue('');
  sheet.getRange(dataRow, colUpdatedBy).setValue('');
  sheet.getRange('B1').setValue('');
  sheet.getRange('B2').setValue('');
  sheet.getRange('B3').setValue('');
  SpreadsheetApp.flush();

  var beforeAt = sheet.getRange(dataRow, colUpdatedAt).getValue();
  var beforeBy = sheet.getRange(dataRow, colUpdatedBy).getValue();
  var beforeB1 = sheet.getRange('B1').getValue();
  var beforeB2 = sheet.getRange('B2').getValue();
  var beforeB3 = sheet.getRange('B3').getValue();
  Logger.log('BEFORE: at=' + beforeAt + ' by=' + beforeBy +
    ' B1=' + beforeB1 + ' B2=' + beforeB2 + ' B3=' + beforeB3);

  // ---- 2. SIMULASIKAN EDIT ----
  var e = {
    source: ss,
    range: sheet.getRange(dataRow, 6), // edit kolom "NAMA KONSUMEN"
    value: 'TEST_AUDIT_' + Date.now()
  };
  onEditHandler(e);

  // ---- 3. BACA SESUDAH ----
  var afterAt = sheet.getRange(dataRow, colUpdatedAt).getValue();
  var afterBy = sheet.getRange(dataRow, colUpdatedBy).getValue();
  var afterB1 = sheet.getRange('B1').getValue();
  var afterB2 = sheet.getRange('B2').getValue();
  var afterB3 = sheet.getRange('B3').getValue();
  Logger.log('AFTER: at=' + afterAt + ' by=' + afterBy +
    ' B1=' + afterB1 + ' B2=' + afterB2 + ' B3=' + afterB3);

  // ---- 4. VERIFIKASI ----
  var passed = true;
  if (!afterAt) {
    Logger.log('FAIL: UPDATED AT kosong');
    passed = false;
  }
  if (!afterBy) {
    Logger.log('FAIL: UPDATED BY kosong');
    passed = false;
  }
  if (!afterB1) {
    Logger.log('FAIL: Global B1 kosong');
    passed = false;
  }
  if (!afterB2) {
    Logger.log('FAIL: Global B2 kosong');
    passed = false;
  }
  if (!afterB3) {
    Logger.log('FAIL: Global B3 kosong');
    passed = false;
  }

  if (passed) {
    Logger.log('PASS: Audit row dan global cells berhasil diupdate setelah dikosongkan');
  }
}