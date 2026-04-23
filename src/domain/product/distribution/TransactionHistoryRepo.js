// src/domain/distribusi/history/TransactionHistoryRepo.js

class TransactionHistoryRepo {
  constructor() {
    this.hotConfig = AppConfig.DB_DISTRIBUSI_CURRENT;
    this.coldConfigs = AppConfig.DB_DISTRIBUSI_COLD;
  }

  getNormalizedHistoryByBatch(batchNo) {
    let history = [];

    if (this.coldConfigs && Array.isArray(this.coldConfigs)) {
      this.coldConfigs.forEach(config => {
        if (config.DB_DISTRIBUSI_ID && config.DB_DISTRIBUSI_ID !== 'NOT_SET_YET') {
          const records = this._fetchAndNormalize(config, batchNo, false);
          history = history.concat(records);
        }
      });
    }

    if (this.hotConfig) {
      const hotRecords = this._fetchAndNormalize(this.hotConfig, batchNo, true);
      history = history.concat(hotRecords);
    }

    history.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    return history;
  }

  _fetchAndNormalize(config, batchNo, isHot) {
    const ssId = isHot ? config.DB_DISTRIBUSI_CURRENT_ID : config.DB_DISTRIBUSI_ID;
    const primaryName = isHot ? config.DB_DISTRIBUSI_CURRENT_SHEET_NAME : config.DB_DISTRIBUSI_SHEET_NAME;
    const fallbackName = isHot ? config.DB_DISTRIBUSI_CURRENT_TABLE_NAME : config.DB_DISTRIBUSI_TABLE_NAME;
    const startRow = isHot ? config.DB_DISTRIBUSI_CURRENT_START_ROW : config.DB_DISTRIBUSI_START_ROW;
    const map = config.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
    
    try {
      const ss = SpreadsheetApp.openById(ssId);
      let sheet = ss.getSheetByName(primaryName) || ss.getSheetByName(fallbackName);
      if (!sheet) return []; 

      const lastRow = sheet.getLastRow();
      if (lastRow < startRow) return [];

      const rawData = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();
      const results = [];
      const targetBatch = String(batchNo).trim().toLowerCase();
      const batchColIndex = map.batch - 1; 

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const currentBatch = String(row[batchColIndex] || '').trim().toLowerCase();

        if (currentBatch === targetBatch) {
          results.push({
            tanggal: row[map.tanggal - 1],
            namaKonsumen: String(row[map.namaKonsumen - 1] || ''),
            kotaCabang: String(row[map.kotaCabang - 1] || ''),
            kodeBarang: String(row[map.kodeBarang - 1] || ''),
            batch: currentBatch,
            penerimaan: parseFloat(row[map.penerimaan - 1]) || 0,
            distribusi: parseFloat(row[map.distribusi - 1]) || 0,
            keterangan: String(row[map.keterangan - 1] || ''),
            sumber: isHot ? config.DB_DISTRIBUSI_CURRENT_YEAR : config.DB_DISTRIBUSI_YEAR
          });
        }
      }
      return results;
    } catch (error) {
      console.error(`Error membaca sheet ${primaryName}: ${error.toString()}`);
      return [];
    }
  }
}