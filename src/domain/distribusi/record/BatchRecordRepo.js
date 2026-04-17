// src/domain/distribusi/record/BatchRecordRepo.js

class BatchRecordRepo {
  constructor() {
    this.hotConfig = AppConfig.DB_CURRENT_DISTRIBUSI_CURRENT;
    this.coldConfigs = AppConfig.DB_CURRENT_DISTRIBUSI_COLD;
  }

  getHistoryByBatch(batchNo) {
    let history = [];

    // 1. Tarik dari Cold Storage
    if (this.coldConfigs && Array.isArray(this.coldConfigs)) {
      this.coldConfigs.forEach(config => {
        if (config.DB_DISTRIBUSI_ID && config.DB_DISTRIBUSI_ID !== 'NOT_SET_YET') {
          const records = this._findInSheet(config, batchNo);
          history = history.concat(records);
        }
      });
    }

    // 2. Tarik dari Hot Storage
    if (this.hotConfig) {
      const hotRecords = this._findInSheet(this.hotConfig, batchNo);
      history = history.concat(hotRecords);
    }

    // 3. Urutkan berdasarkan tanggal (Ascending - Lama ke Baru)
    history.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    // Lempar error kalau beneran 100% kosong dari semua sumber
    if (history.length === 0) {
       throw new Error(`Data histori untuk batch ${batchNo} benar-benar tidak ditemukan di semua sumber.`);
    }

    return history;
  }

  _findInSheet(config, batchNo) {
    const ssId = config.DB_DISTRIBUSI_ID;
    const primaryName = config.DB_DISTRIBUSI_SHEET_NAME;
    const fallbackName = config.DB_DISTRIBUSI_TABLE_NAME; // Juru selamat kalau admin ganti nama sheet
    
    const startRow = config.DB_DISTRIBUSI_START_ROW;
    const map = config.DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER;
    
    try {
      const ss = SpreadsheetApp.openById(ssId);
      
      // THE FIX: Pintar nyari nama Sheet
      let sheet = ss.getSheetByName(primaryName);
      if (!sheet) {
        sheet = ss.getSheetByName(fallbackName); // Coba nama cadangan
        if (!sheet) {
          console.error(`Sheet '${primaryName}' atau '${fallbackName}' ga ketemu di ID: ${ssId}`);
          return []; // Skip file ini, lanjut file lain
        }
      }

      const lastRow = sheet.getLastRow();
      if (lastRow < startRow) return [];

      // THE FIX: Sedot data ke RAM, jangan pakai TextFinder biar nggak manja sama spasi
      const rawData = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();
      const results = [];
      
      const targetBatch = String(batchNo).trim().toLowerCase();
      const batchColIndex = map.batch - 1; // Array mulai dari 0

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const currentBatch = String(row[batchColIndex] || '').trim().toLowerCase();

        // Kalau batch-nya klop (mengabaikan huruf besar/kecil & spasi berlebih)
        if (currentBatch === targetBatch) {
          results.push({
            tanggal: row[map.tanggal - 1],
            namaKonsumen: String(row[map.namaKonsumen - 1] || ''),
            kotaCabang: String(row[map.kotaCabang - 1] || ''),
            penerimaan: parseFloat(row[map.penerimaan - 1]) || 0,
            distribusi: parseFloat(row[map.distribusi - 1]) || 0,
            keterangan: String(row[map.keterangan - 1] || ''),
            sumber: config.DB_DISTRIBUSI_YEAR || 'CURRENT'
          });
        }
      }

      return results;
    } catch (error) {
      console.error(`Error membaca sheet ${config.DB_DISTRIBUSI_YEAR}: ${error.toString()}`);
      return [];
    }
  }
}