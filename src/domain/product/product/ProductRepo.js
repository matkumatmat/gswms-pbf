// src/domain/product/product/ProductRepo.js

class ProductRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_PRODUCT_LOOKUP_ID, AppConfig.DB_PRODUCT_LOOKUP_SHEET_NAME);
        this.startRow = AppConfig.DB_PRODUCT_LOOKUP_START_ROW || 2;
    }

    getAllProductRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}