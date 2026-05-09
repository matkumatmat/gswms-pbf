// source/server/repositories/history/HistoryShippingEmbalageRepository.js

function HistoryShippingEmbalageRepository(adapter) {
  this.adapter = adapter;

  this.findByNoDokumen = function(noDokumen) {
    return this.adapter.findByNoDokumen(noDokumen);
  };

  this.findByKodeBarang = function(kodeBarang) {
    return this.adapter.findByKodeBarang(kodeBarang);
  };

  this.findByNamaBarang = function(namaBarang) {
    return this.adapter.findByNamaBarang(namaBarang);
  };

  this.findByField = function(fieldName, value) {
    return this.adapter.findByField(fieldName, value);
  };

  this.getAll = function() {
    return this.adapter.getAll();
  };

  this.getByYear = function(year) {
    return this.adapter.getByYear(year);
  };
}