// src/domain/product/product/ProductRepo.js

class ProductRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_PRODUCT_LOOKUP_ID, AppConfig.DB_PRODUCT_LOOKUP_SHEET_NAME);
        this.startRow = AppConfig.DB_PRODUCT_LOOKUP_START_ROW || 2;
    }

    static get TABLE_KEYS(){
        return [
            'id', 'kodeBarang', 'kodeBarangNew', 'namaDagang', 'namaBarangNew', 
            'kategori', 'jenis', 'tahun', 'hjp', 'het', 
            'updatedAt', 'updatedBy'
        ]
    }

    getAllProductRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }

    getPaginatedRawData(page = 1, limit = 500) {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        const data = rawData.slice(skipCount);
        const start = (page - 1) * limit;
        return data.slice(start, start + limit);
    }    
}