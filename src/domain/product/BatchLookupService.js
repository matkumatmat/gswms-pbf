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
        
        this.shortKeys = ['id', 'productId', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'batch', 'expiryDate', 'perBucket'];
    }

    _joinBatchWithProduct(rawBatchData) {
        const rawProducts = this.productRepo.getAllProductRaw();
        const productMap = new Map();
        
        rawProducts.forEach(row => {
            const pId = String(row[AppConfig.DB_PRODUCT_LOOKUP_ID_COL - 1] || '').trim();
            if (pId) {
                productMap.set(pId, {
                    kodeBarangOld: String(row[AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_OLD_COL - 1] || '-'),
                    kodeBarangNew: String(row[AppConfig.DB_PRODUCT_LOOKUP_KODE_BARANG_NEW_COL - 1] || '-'),
                    namaDagang: String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL - 1] || ''),
                    namaBarangErp: String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_BARANG_ERP_COL - 1] || ''),
                    // THE FIX: TARIK JUGA DATA KATEGORI DLL KE DALAM MAP
                    kategori: String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL] || ''), // Sesuai index kategori di AppConfig lu
                    jenis: String(row[AppConfig.DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL + 1] || ''), // Index jenis
                    hjphet: AppUtils.safeParseJson(row[AppConfig.DB_PRODUCT_LOOKUP_TAHUN_COL - 1]) // Index HJP HET
                });
            }
        });

        const batches = AppUtils.mapArrayToObject(rawBatchData, this.batchTableKeys);
        
        return batches.map(batch => {
            const master = productMap.get(batch.productId) || {};
            return {
                ...batch,
                kodeBarangOld: master.kodeBarangOld || '-',
                kodeBarangNew: master.kodeBarangNew || '-',
                namaBarangDagang: master.namaDagang || '-',
                namaBarangErp: master.namaBarangErp || '-',
                // Inject the missing data!
                kategori: master.kategori || '-',
                jenis: master.jenis || '-',
                hjphet: master.hjphet || {}
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