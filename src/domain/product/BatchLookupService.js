// src/domain/product/BatchLookupService.js

class BatchLookupService {
    // KITA INJECT PRODUCT REPO JUGA KE SINI!
    constructor(repo, productRepo) {
        this.repo = repo;
        this.productRepo = productRepo; 
        this.defaultLimit = 500;
        
        // !!! PERHATIAN BOS !!!
        // LU WAJIB BIKIN URUTAN INI SESUAI SAMA KOLOM PM_BATCH LU YANG BARU!
        // Asumsi gue: 1:id, 2:productId, 3:alokasi, 4:sektor, 5:nie, 6:noDokPenerimaan, 7:batch, dst...
        this.batchTableKeys = [
            'id', 'productId', 'alokasi', 'sektor','kodeBarang', 'namaDagang', 'batch',
            'manufacturingDate', 'expiryDate', 'status', 'rslBulan', 'sysStatus','nie',
            'fotoUrl', 'infoUrl', 'dimensionPLT', 'berat', 'catatanFisik','noDokPenerimaan',
            'rslHari', 'perBucket', 'createdAt', 'updatedAt', 'updatedBy', 'notes'
        ];
        
        this.shortKeys = ['id', 'kodeBarang', 'namaBarangDagang', 'batch', 'expiryDate', 'perBucket'];
    }

    /**
     * ENGINE PENGGABUNG (JOIN) BATCH + PRODUCT
     */
    _joinBatchWithProduct(rawBatchData) {
        // 1. Tarik Data Master Produk
        const rawProducts = this.productRepo.getAllProductRaw();
        const productKeys = ['id', 'kodeBarang', 'namaDagang', 'namaBarangNew', 'kategori', 'jenis', 'tahun', 'hjphet', 'updatedAt', 'updatedBy'];
        const products = AppUtils.mapArrayToObject(rawProducts, productKeys);
        
        // 2. Bikin Dictionary biar nyarinya ngebut! (O(1) complexity)
        const productMap = new Map();
        products.forEach(p => productMap.set(p.id, p));

        // 3. Map Batch Data & Kawinin
        const batches = AppUtils.mapArrayToObject(rawBatchData, this.batchTableKeys);
        
        return batches.map(batch => {
            const master = productMap.get(batch.productId) || {};
            // Inject data dari master ke batch biar Frontend gak nyadar ada perubahan DB!
            return {
                ...batch,
                kodeBarang: master.kodeBarang || '-',
                namaBarangDagang: master.namaDagang || '-',
                namaBarangErp: master.namaBarangNew || '-',
                kategori: master.kategori || '-',
                jenis: master.jenis || '-',
                hjphet: AppUtils.safeParseJson(master.hjphet) || {}
            };
        });
    }

    getAllBatchLookup() {
        const rawData = this.repo.getAllBatchLookupRaw();
        const joinedData = this._joinBatchWithProduct(rawData);
        const processed = this._processJsonFields(joinedData);
        return processed.filter(e => e.batch !== null && e.batch !== '');
    }
    
    getPaginatedData(page = 1, requestedLimit = null) {
        const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limit);
        const joinedData = this._joinBatchWithProduct(rawData);
        const processed = this._processJsonFields(joinedData);
        return processed.filter(e => e.batch !== null && e.batch !== '');
    }

    getShortBatchLookup(page = 1, requestedLimit = null) {
        const limit = requestedLimit ? parseInt(requestedLimit) : 5000;
        const rawData = this.repo.getPaginatedRawData(page, limit);
        const joinedData = this._joinBatchWithProduct(rawData);
        const validBatchLookups = joinedData.filter(e => e.batch !== null && e.batch !== '');        
        
        return validBatchLookups.map(fullObj => {
            let simpleObj = {};
            this.shortKeys.forEach(key => simpleObj[key] = fullObj[key]);
            return simpleObj;
        });
    }

    getDetail(payload) {
        // Logikanya sama, tarik semua, JOIN, terus FIND 1 data
        const rawData = this.repo.getAllBatchLookupRaw();
        const joinedData = this._joinBatchWithProduct(rawData);
        
        let found = null;
        if (payload.id) found = joinedData.find(e => e.id === payload.id);
        else if (payload.batch) found = joinedData.find(e => e.batch === payload.batch);
        else if (payload.kodeBarang) found = joinedData.find(e => e.kodeBarang === payload.kodeBarang);

        if (!found) return null;
        return this._processJsonFields([found])[0];
    }

    _processJsonFields(items) {
        return items.map(item => {
            ['fotoUrl', 'infoUrl', 'dimensionPLT'].forEach(key => {
                if (item[key]) item[key] = AppUtils.safeParseJson(item[key]);
            });
            return item;
        });
    }
}