// src/domain/distribusi/history/TransactionHistoryService.js

class TransactionHistoryService {
  constructor(transactionHistoryRepo) {
    this.repo = transactionHistoryRepo;
  }

  getHistory(payload) {
    const { batchNo } = payload;
    if (!batchNo) {
      throw new Error("Nomor Batch harus disertakan.");
    }
    
    return this.repo.getNormalizedHistoryByBatch(batchNo);
  }
}