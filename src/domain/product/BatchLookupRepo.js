// src/domain/product/BatchLookupService.js

class BatchLookupRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_BATCH_LOOKUP_ID, AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
        this.startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
    }

    getAllBatchLookupRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}