// src/domain/product/product/ProductRepo.js

class ProductRepo extends BaseRepository {
    constructor() {
        // Asumsi PM_PRODUCT ada di Spreadsheet yang sama dengan PM_BATCH
        super(AppConfig.DB_BATCH_LOOKUP_ID, AppConfig.DB_PRODUCT_SHEET_NAME);
        this.startRow = AppConfig.DB_PRODUCT_START_ROW || 2;
    }

    getAllProductRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}