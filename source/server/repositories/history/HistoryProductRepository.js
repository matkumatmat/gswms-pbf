// source/server/repositories/history/ProductHistoryRepository.js

function ProductHistoryRepository(adapter) {
  this.adapter = adapter;

  this.findByBatch = function(batchNo) {
    return this.adapter.findByBatch(batchNo);
  };

  this.findByKodeBarang = function(kodeBarang) {
    return this.adapter.findByKodeBarang(kodeBarang);
  };

  this.findByNamaKonsumen = function(namaKonsumen) {
    return this.adapter.findByNamaKonsumen(namaKonsumen);
  };

  this.findByField = function(fieldName, value) {
  return this.adapter.findByField(fieldName, value);
};
}