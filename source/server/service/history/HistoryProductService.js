// source/server/service/history/ProductHistoryService.js

function ProductHistoryService(repository) {
  this.repo = repository;
  this.currentUser = null;

  this.setCurrentUser = function(user) {
    this.currentUser = user;
  };

  this._normalizeRecord = function(rawItem) {
    var record = rawItem.record;
    var sheetType = rawItem.sheetType;
    var tahun = rawItem.year;

    var base = {
      id: record.id || null,
      tanggal: record.tanggal || null,
      batch: record.batch || null,
      kodeBarang: record.kodeBarang || null,
      namaBarang: record.namaBarang || null,
      penerimaan: NumberUtils.toNumber(record.penerimaan || 0),
      distribusi: NumberUtils.toNumber(record.distribusi || 0),
      keterangan: record.keterangan || record.catatan || '',
      sumberTahun: tahun,
      sumberType: sheetType,
      jenisTransaksi: 'UNKNOWN'
    };

    if (sheetType === 'ALL_RCV') {
      base.jenisTransaksi = 'RECEIVING';
      base.penerimaan = NumberUtils.toNumber(record.jumlahFisik || 0); // fix
      base.noDokumen = record.noDokumen || null;
      base.placement = record.placement || null;
      base.kondisiKemasan = record.kondisiKemasan || null;
    } else if (sheetType === 'ALL_DIST') {
      base.jenisTransaksi = 'DISTRIBUTION';
      base.noDok = record.noDok || record.noDokumen || null;
      base.kotaCabang = record.kotaCabang || null;
      base.namaKonsumen = record.namaKonsumen || null;
    } else if (sheetType === 'ALL_CONS') {
      base.jenisTransaksi = 'CONSIGNMENT';
      base.namaKonsumen = record.namaKonsumen || null;
      base.kotaCabang = record.kotaCabang || null;
    }
    return base;
  };

  // Filter tanggal, sorting, limit
  this._applyOptions = function(items, options) {
    if (!options) return items;
    var result = items.slice();

    if (options.startDate) {
      var start = new Date(options.startDate);
      result = result.filter(function(r) { return r.tanggal && new Date(r.tanggal) >= start; });
    }
    if (options.endDate) {
      var end = new Date(options.endDate);
      result = result.filter(function(r) { return r.tanggal && new Date(r.tanggal) <= end; });
    }
    result.sort(function(a,b) { return new Date(a.tanggal) - new Date(b.tanggal); });
    if (options.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }
    return result;
  };

  // === PUBLIC API ===
  this.getHistoryByBatch = function(batchNo, options) {
    if (!batchNo) throw new Error('Batch number required');
    var raw = this.repo.findByBatch(batchNo);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  this.getHistoryByKodeBarang = function(kodeBarang, options) {
    if (!kodeBarang) throw new Error('Kode barang required');
    var raw = this.repo.findByKodeBarang(kodeBarang);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  this.getHistoryByNamaKonsumen = function(namaKonsumen, options) {
    if (!namaKonsumen) throw new Error('Nama konsumen required');
    var raw = this.repo.findByNamaKonsumen(namaKonsumen);
    var normalized = raw.map(this._normalizeRecord.bind(this));
    return this._applyOptions(normalized, options);
  };

  this.getHistoryByField = function(fieldName, value, options) {
  if (!fieldName || !value) throw new Error('fieldName and value required');
  var raw = this.repo.findByField(fieldName, value);
  var normalized = raw.map(this._normalizeRecord.bind(this));
  return this._applyOptions(normalized, options);
};
}