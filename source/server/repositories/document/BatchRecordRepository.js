// source/server/repositories/document/BatchRecordRepository.js
function BatchRecordRepository(adapter) {
  this.adapter = adapter;

  this.getEnrichedHistory = function(batchNo) {
    return this.adapter.getEnrichedHistory(batchNo);
  };
}