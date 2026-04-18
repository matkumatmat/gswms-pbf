// src/domain/product/BatchLookupService.js

class BatchLookupService {
    constructor(repo, productRepo) {
        this.repo = repo;
        this.productRepo = productRepo; 
        this.defaultLimit = 500;
        
        this.batchTableKeys = [
            'id', 'productId', 'alokasi', 'sektor','kodeBarang', 'namaDagang', 'batch',
            'manufacturingDate', 'expiryDate', 'status', 'rslBulan', 'sysStatus','nie',
            'fotoUrl', 'infoUrl', 'dimensionPLT', 'berat', 'catatanFisik','noDokPenerimaan',
            'rslHari', 'perBucket', 'createdAt', 'updatedAt', 'updatedBy', 'notes'
        ];
        
        this.shortKeys = ['id', 'productId', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'batch', 'expiryDate', 'perBucket'];
    }

    _joinBatchWithProduct(rawBatchData) {
        const rawProducts = this.productRepo.getAllProductRaw();
        
        // THE FIX: Kembali ke jalan yang benar! Pake Table Keys yang elegan.
        // Sesuai urutan 12 Kolom di PM_PRODUCT lu
        const productKeys = [
            'id', 'kodeBarangOld', 'kodeBarangNew', 'namaDagang', 'namaBarangErp', 
            'kategori', 'jenis', 'tahun', 'hjp', 'het', 
            'updatedAt', 'updatedBy'
        ];
        
        // Parsing jadi Object pake utility andalan kita
        const products = AppUtils.mapArrayToObject(rawProducts, productKeys);
        
        // Bikin Dictionary (O(1) Search)
        const productMap = new Map();
        products.forEach(p => {
            if (p.id) productMap.set(p.id, p);
        });

        // Parsing Batch Data
        const batches = AppUtils.mapArrayToObject(rawBatchData, this.batchTableKeys);
        
        return batches.map(batch => {
            const master = productMap.get(batch.productId) || {};
            return {
                ...batch,
                // Inject the joined data cleanly
                kodeBarangOld: master.kodeBarangOld || '-',
                kodeBarangNew: master.kodeBarangNew || '-',
                namaBarangDagang: master.namaDagang || '-',
                namaBarangErp: master.namaBarangErp || '-',
                kategori: master.kategori || '-',
                jenis: master.jenis || '-',
                hjp: parseFloat(master.hjp) || 0,
                het: parseFloat(master.het) || 0
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
        const rawData = this.repo.getAllBatchLookupRaw();
        const joinedData = this._joinBatchWithProduct(rawData);
        
        let found = null;
        if (payload.id) found = joinedData.find(e => e.id === payload.id);
        else if (payload.batch) found = joinedData.find(e => e.batch === payload.batch);

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