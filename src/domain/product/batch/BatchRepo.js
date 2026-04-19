// src/domain/product/batch/BatchRepo.js

class BatchRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_BATCH_LOOKUP_ID, AppConfig.DB_BATCH_LOOKUP_SHEET_NAME);
        this.startRow = AppConfig.DB_BATCH_LOOKUP_START_ROW;
    }

    static get TABLE_KEYS() {
        return [
            'id', 'productId', 'alokasi', 'sektor','kodeBarang', 'namaDagang', 'batch',
            'manufacturingDate', 'expiryDate', 'status', 'rslBulan', 'sysStatus','nie',
            'fotoUrl', 'infoUrl', 'dimensionPLT', 'berat', 'catatanFisik','noDokPenerimaan',
            'rslHari', 'perBucket', 'createdAt', 'updatedAt', 'updatedBy', 'notes'
        ]
    }
    
    getAllBatchLookupRaw() {
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