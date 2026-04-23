// src/domain/product/batch/BatchService.js

class BatchService extends BaseService {
    constructor(batchRepo, productRepo) {
        super(batchRepo, 500); // Call parent constructor
        this.productRepo = productRepo;
        this.jsonFields = ['fotoUrl', 'infoUrl', 'dimensionPLT']; // Config for _processJsonFields
    }

    // ========================================================================
    // SPECIFIC: Join Logic (Tetap di sini karena unik untuk Batch+Product)
    // ========================================================================
    _joinBatchWithProduct(rawBatchData){
        const rawProducts = this.productRepo.getAllProductRaw();
        const productKeys = ProductRepo.TABLE_KEYS;
        const products = AppUtils.mapArrayToObject(rawProducts, productKeys);
        
        const productMap = new Map();
        products.forEach(p => { if (p.id) productMap.set(p.id, p); });

        const batchKeys = BatchRepo.TABLE_KEYS;
        const batches = AppUtils.mapArrayToObject(rawBatchData, batchKeys);

        return batches.map(batch => {
            const master = productMap.get(batch.productId) || {};
            return Object.assign({}, batch, {
                kodeBarangOld: master.kodeBarangOld || '-',
                kodeBarangNew: master.kodeBarangNew || '-',
                namaBarangDagang: master.namaDagang || '-',
                namaBarangErp: master.namaBarangErp || '-',
                kategori: master.kategori || '-',
                jenis: master.jenis || '-',
                hjp: parseFloat(master.hjp) || 0,
                het: parseFloat(master.het) || 0
            });
        });
    }

    // Di BatchService.js

_createBatchActiveFilter() {
    return (item) => {
        if (!item || !item.id || String(item.id).trim() === '') return false;
        if (!item.productId || String(item.productId).trim() === '') return false;
        // if (String(item.status || '').toUpperCase().trim() !== 'RECEIVED') return false;
        // if (String(item.sysStatus || '').toUpperCase().trim() !== 'ACTIVE') return false;
        return true;
    };
}

getActiveReceivedBatches(page = 1, limit = null, schema = 'short') {
    const rawData = this.repo.getPaginatedRawData(page, limit || this.defaultLimit);
    const joinedData = this._joinBatchWithProduct(rawData);
    const processed = this._processJsonFields(joinedData);
    const filtered = processed.filter(this._createBatchActiveFilter());
    return this._project(filtered, schema);
}

    // ========================================================================
    // PUBLIC API: Method-method yang pakai pattern dari BaseService
    // ========================================================================
    getAllBatchLookup(schemaName = 'table') {
        const rawData = this.repo.getAllBatchLookupRaw();
        const joinedData = this._joinBatchWithProduct(rawData);
        const processed = this._processJsonFields(joinedData);
        // Pakai _applyFilters dari parent
        const filtered = this._applyFilters(processed, { allowedStatuses: null }, 'batch');
        return this._project(filtered, schemaName);
    }
    
    getPaginatedData(page = 1, limit = null, schemaName = 'table', filterConfig = null) {
        const limitNum = limit ? parseInt(limit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limitNum);
        const joinedData = this._joinBatchWithProduct(rawData);
        const processed = this._processJsonFields(joinedData);
        const filtered = this._applyFilters(processed, filterConfig, 'batch');
        return this._project(filtered, schemaName);
    }

    getShortBatchLookup(page = 1, limit = null) {
        const filterConfig = {
            allowedStatuses: ['ACTIVE', 'INACTIVE', 'CLOSED', 'NTC','EXPIRED']
        };
        return this.getPaginatedData(page, limit, 'short', filterConfig);
    }

    getTableData(page = 1, limit = null, filterConfig = null) {
        return this.getPaginatedData(page, limit, 'table', filterConfig);
    }

    getDetail(payload) {
        const rawData = this.repo.getAllBatchLookupRaw();
        const joinedData = this._joinBatchWithProduct(rawData);
        
        let found = null;
        if (payload && payload.id) {
            found = joinedData.find(e => e.id === payload.id);
        } else if (payload && payload.batch) {
            found = joinedData.find(e => e.batch === payload.batch);
        }

        if (!found) return null;
        
        // THE FIX: Langsung return object mentahnya. JANGAN di-project pake SchemaRegistry!
        // Biar frontend tetep dapet key 'expiryDate', 'manufacturingDate', dll secara utuh.
        return this._processJsonFields([found])[0];
    }    

    query(params) {
        const {
            page = 1,
            limit = null,
            schema = 'table',
            filters = {},
            customFilter = null
        } = params || {};

        const rawData = this.repo.getPaginatedRawData(page, limit || this.defaultLimit);
        const joinedData = this._joinBatchWithProduct(rawData);
        const processed = this._processJsonFields(joinedData);

        const filterConfig = {
            allowedStatuses: filters.sysStatusIn || null,
            custom: customFilter || this._createDefaultFilter(filters)
        };

        const filtered = this._applyFilters(processed, filterConfig, 'batch');
        return this._project(filtered, schema);
    }
}