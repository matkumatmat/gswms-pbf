//legacy
// // source/server/adapters/document/BatchRecordAdapter.js
// function BatchRecordAdapter() {
//   const historyAdapter = new ProductHistoryReaderAdapter(); // sudah ada
//   const batchAdapter = new BatchSheetAdapter(); // untuk mengambil NIE

//   // Ambil semua batch (cached) untuk lookup NIE
//   let batchMap = null;

//   function loadBatchMap() {
//     if (batchMap) return batchMap;
//     const batches = batchAdapter.getAll();
//     batchMap = new Map();
//     batches.forEach(b => {
//       const batchNo = String(b.batch || '').trim().toUpperCase();
//       if (batchNo) {
//         batchMap.set(batchNo, {
//           nie: b.nie || '-',
//           namaBarang: b.namaDagang || '-',
//           kodeBarang: b.kodeBarang || '-'
//         });
//       }
//     });
//     return batchMap;
//   }

//   // ─── CACHE INVALIDATION ────────────────────────────────────────────────────
//   // Invalidasi CacheService (ProductHistoryReaderAdapter pakai ini)
//   // + clear in-memory service instances di TransactionalFactory
//   // Dipanggil sebelum fetch data, supaya selalu baca sheet terbaru
//   function _invalidateHistoryCache() {
//     var sheetTypes = ['ALL_DIST', 'ALL_RCV'];
//     var yearConfigs = ApplicationConfig.dataSources.transactional;

//     yearConfigs.forEach(function(yearConfig) {
//       sheetTypes.forEach(function(sheetType) {
//         var cacheGroup = 'TRANS_' + yearConfig.year + '_' + sheetType;
//         CacheRegistry.invalidate(cacheGroup);
//       });
//     });
//     TransactionalFactory.clearCache();
//     Logger.log('[BatchRecordAdapter] cache invalidated for ALL_DIST + ALL_RCV, all years');
//   }

//   /**
//    * Ambil raw history dari semua tahun, lalu enrich dengan data batch (NIE, nama barang, kode barang)
//    * @param {string} batchNo
//    * @returns {Array<Object>} array objek siap untuk diproyeksi
//    */
//   this.getEnrichedHistory = function(batchNo) {
//     _invalidateHistoryCache();
//     const batchInfoMap = loadBatchMap();
//     const batchInfo = batchInfoMap.get(String(batchNo).trim().toUpperCase())
//       || { nie: '-', namaBarang: '-', kodeBarang: '-' };

//     // FILTER: buang yang tidak relevan untuk batch record
//     const rawHistory = historyAdapter.findByBatch(batchNo)
//       .filter(function(item) {
//         // ALL_CONS tidak masuk batch record
//         if (item.sheetType === 'ALL_CONS') return false;

//         if (item.sheetType === 'ALL_DIST') {
//           // Buang mirror row: DIST row yang punya penerimaan tapi distribusi=0
//           // (ini duplikat dari RCV, bukan distribusi asli)
//           var dist = NumberUtils.toNumber(item.record.distribusi);
//           return dist > 0;
//         }

//         if (item.sheetType === 'ALL_RCV') {
//           // Buang RCV record yang tahun tanggalnya ≠ tahun sheet
//           // (cegah duplikat record 2025 yang muncul di spreadsheet 2026)
//           var tgl = item.record.tanggal;
//           if (tgl) {
//             var recordYear = String(new Date(tgl).getFullYear());
//             if (recordYear !== item.year) return false;
//           }
//           return true;
//         }

//         return true;
//       });

//     // SORT: tanggal ascending sebelum proses apapun
//     // supaya Map insertion order = urutan kronologis
//     rawHistory.sort(function(a, b) {
//       return new Date(a.record.tanggal) - new Date(b.record.tanggal);
//     });

//     // MERGE: gabung row dengan key tanggal + namaKonsumen + kotaCabang
//     const mergeMap = new Map();

//     rawHistory.forEach(function(item) {
//       const record = item.record;

//       // Skip baris saldo awal
//       const konsumen = (record.namaKonsumen || '').toUpperCase();
//       if (konsumen.includes('SALDO AWAL')) return;

//       // Resolusi penerimaan & distribusi per sheetType
//       // - RCV  : penerimaan = jumlahFisik, distribusi = 0
//       // - DIST : penerimaan = 0 (SELALU, tidak pernah ambil dari field penerimaan DIST)
//       //          distribusi = nilai distribusi
//       const penerimaan = item.sheetType === 'ALL_RCV'
//         ? NumberUtils.toNumber(record.jumlahFisik)
//         : 0;
//       const distribusi = item.sheetType === 'ALL_RCV'
//         ? 0
//         : NumberUtils.toNumber(record.distribusi);

//       // Normalisasi tanggal ke YYYY-MM-DD untuk merge key
//       const tglKey   = DateUtils.formatYYYYMMDD(record.tanggal);
//       const mergeKey = [
//         tglKey,
//         (record.namaKonsumen || '').trim(),
//         (record.kotaCabang   || '').trim()
//       ].join('|');

//       if (mergeMap.has(mergeKey)) {
//         const existing = mergeMap.get(mergeKey);
//         existing.penerimaan += penerimaan;
//         existing.distribusi += distribusi;
//       } else {
//         mergeMap.set(mergeKey, {
//           tanggal:      record.tanggal      || '-',
//           namaKonsumen: record.namaKonsumen || '-',
//           kotaCabang:   record.kotaCabang   || '-',
//           kodeBarang:   batchInfo.kodeBarang,
//           namaBarang:   batchInfo.namaBarang,
//           batch:        record.batch        || batchNo,
//           nie:          batchInfo.nie,
//           penerimaan:   penerimaan,
//           distribusi:   distribusi
//         });
//       }
//     });

//     // RUNNING BALANCE: Map preserve insertion order = urutan tanggal
//     let runningBalance = 0;
//     const enriched = [];

//     mergeMap.forEach(function(row) {
//       runningBalance += row.penerimaan - row.distribusi;
//       enriched.push(Object.assign({}, row, { saldo: runningBalance }));
//     });

//     return enriched;
//   };
// }


// new

// source/server/adapters/document/BatchRecordAdapter.js
function BatchRecordAdapter() {
  const historyAdapter = new ProductHistoryReaderAdapter();
  const batchAdapter = new BatchMasterAdapter();

  let batchMap = null;

  function loadBatchMap() {
    if (batchMap) return batchMap;
    const batches = batchAdapter.getAll();
    batchMap = new Map();
    batches.forEach(b => {
      const batchNo = String(b.batch || '').trim().toUpperCase();
      if (batchNo) {
        batchMap.set(batchNo, {
          nie: b.nie || '-',
          namaBarang: b.namaDagang || '-',
          kodeBarang: b.kodeBarang || '-',
          mfgDate: b.mfgDate || '',
          expireDate: b.expireDate || ''
        });
      }
    });
    return batchMap;
  }

  // ─── CACHE INVALIDATION ────────────────────────────────────────────────────
  function _invalidateHistoryCache() {
    var sheetTypes = ['ALL_DIST', 'ALL_RCV'];
    var yearConfigs = ApplicationConfig.dataSources.transactional;
    yearConfigs.forEach(function(yearConfig) {
      sheetTypes.forEach(function(sheetType) {
        var cacheGroup = 'TRANS_' + yearConfig.year + '_' + sheetType;
        CacheRegistry.invalidate(cacheGroup);
      });
    });
    TransactionalFactory.clearCache();
    Logger.log('[BatchRecordAdapter] cache invalidated for ALL_DIST + ALL_RCV, all years');
  }

  /**
   * Mengambil raw history, melakukan filtering, merging dengan mergeKey yang baru,
   * sorting multi‑level, dan menghitung saldo berjalan.
   * @param {string} batchNo
   * @returns {Array<Object>} array objek hasil olahan
   */
  this.getEnrichedHistory = function(batchNo) {
    _invalidateHistoryCache();
    const batchInfoMap = loadBatchMap();
    const batchInfo = batchInfoMap.get(String(batchNo).trim().toUpperCase()) || {
      nie: '-', namaBarang: '-', kodeBarang: '-',
      mfgDate: '', expireDate: ''
    };

    // Ambil raw history dan filter
    const rawHistory = historyAdapter.findByBatch(batchNo)
      .filter(function(item) {
        if (item.sheetType === 'ALL_CONS') return false;

        if (item.sheetType === 'ALL_DIST') {
          var dist = NumberUtils.toNumber(item.record.distribusi);
          return dist > 0; // hanya distribusi asli
        }

        if (item.sheetType === 'ALL_RCV') {
          var tgl = item.record.tanggal;
          if (tgl) {
            var recordYear = String(new Date(tgl).getFullYear());
            if (recordYear !== item.year) return false;
          }
          return true;
        }
        return true;
      });

    // MERGE dengan mergeKey baru: [tanggal, sheetType, konsumen, kotaCabang]
    const mergeMap = new Map();
    rawHistory.forEach(function(item) {
      const record = item.record;
      const konsumen = (record.namaKonsumen || '').toUpperCase();
      if (konsumen.includes('SALDO AWAL')) return;

      // Penerimaan hanya dari ALL_RCV, distribusi hanya dari ALL_DIST
      const penerimaan = item.sheetType === 'ALL_RCV'
        ? NumberUtils.toNumber(record.jumlahFisik)
        : 0;
      const distribusi = item.sheetType === 'ALL_RCV'
        ? 0
        : NumberUtils.toNumber(record.distribusi);

      const tglKey   = DateUtils.formatYYYYMMDD(record.tanggal);
      const mergeKey = [
        tglKey,
        item.sheetType,
        (record.namaKonsumen || '').trim(),
        (record.kotaCabang   || '').trim()
      ].join('|');

      if (mergeMap.has(mergeKey)) {
        const existing = mergeMap.get(mergeKey);
        existing.penerimaan += penerimaan;
        existing.distribusi += distribusi;
      } else {
        mergeMap.set(mergeKey, {
          tanggal:      record.tanggal      || '-',
          sheetType:    item.sheetType,      // untuk sorting
          namaKonsumen: record.namaKonsumen || '-',
          kotaCabang:   record.kotaCabang   || '-',
          kodeBarang:   batchInfo.kodeBarang,
          namaBarang:   batchInfo.namaBarang,
          batch:        record.batch        || batchNo,
          nie:          batchInfo.nie,
          penerimaan:   penerimaan,
          distribusi:   distribusi,
          mfgDate:      batchInfo.mfgDate,
          expireDate:   batchInfo.expireDate
        });
      }
    });

    // Ubah Map ke array
    const mergedArray = Array.from(mergeMap.values());

    // --- MULTI-LEVEL SORTING ---
    mergedArray.sort(function(a, b) {
      // Utamakan tanggal ascending
      var dateA = new Date(a.tanggal);
      var dateB = new Date(b.tanggal);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      // Jika tanggal sama, ALL_RCV (penerimaan) di atas ALL_DIST (distribusi)
      if (a.sheetType === 'ALL_RCV' && b.sheetType === 'ALL_DIST') return -1;
      if (a.sheetType === 'ALL_DIST' && b.sheetType === 'ALL_RCV') return 1;
      return 0;
    });

    // --- RUNNING BALANCE ---
    let runningBalance = 0;
    const result = mergedArray.map(function(row) {
      runningBalance += row.penerimaan - row.distribusi;
      // Hapus field sheetType yang tidak diperlukan di output
      const { sheetType, ...cleanRow } = row;
      return Object.assign({}, cleanRow, { saldo: runningBalance });
    });

    return result;
  };
}