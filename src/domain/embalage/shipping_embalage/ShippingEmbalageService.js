// src/domain/embalage/shipping_embalage/ShippingEmbalageService.js

class ShippingEmbalageService extends BaseService {
    constructor(masterRepo, constantRepo) {
        super(masterRepo, 500); 
        this.constantRepo = constantRepo;
    }

    _joinMasterWithConstant(rawMasterData) {
        const rawConstant = this.constantRepo.getAllLookupShippingEmbalageRaw();
        const constants = AppUtils.mapArrayToObject(rawConstant, ConstantShippingEmbalageRepo.TABLE_KEYS);
        
        const constantMap = new Map();
        constants.forEach(c => { 
            if (c.kodeBarang) constantMap.set(c.kodeBarang, c); 
        });

        const masters = AppUtils.mapArrayToObject(rawMasterData, MasterShippingEmbalageRepo.TABLE_KEYS);

        return masters.map(m => {
            const detail = constantMap.get(m.kodeBarang) || {};
            return Object.assign({}, m, {
                aliasErp: detail.aliasErp || '-',
                safeStock: parseFloat(detail.safeStock) || 0,
                reorderPoint: parseFloat(detail.reorderPoint) || 0
            });
        });
    }

    getPaginatedData(page = 1, limit = null, schemaName = 'export', filterConfig = null) {
        const limitNum = limit ? parseInt(limit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limitNum);
        const joinedData = this._joinMasterWithConstant(rawData);
        const filtered = this._applyFilters(joinedData, filterConfig, 'kodeBarang');
        return this._project(filtered, schemaName);
    }


    getDashboardStats() {
        const rawConstant = this.constantRepo.getAllLookupShippingEmbalageRaw();
        const constants = AppUtils.mapArrayToObject(rawConstant, ConstantShippingEmbalageRepo.TABLE_KEYS);

        const rawMaster = this.repo.getAllMasterShippingEmbalageRaw();
        const masters = AppUtils.mapArrayToObject(rawMaster, MasterShippingEmbalageRepo.TABLE_KEYS);

        const stockMap = new Map();

        constants.forEach(c => {
            if(c.kodeBarang) {
                stockMap.set(c.kodeBarang, {
                    kodeBarang: c.kodeBarang,
                    namaBarang: c.namaBarang,
                    satuan: c.satuan || 'Pcs',
                    safeStock: parseFloat(c.safeStock) || 0,
                    reorderPoint: parseFloat(c.reorderPoint) || 0,
                    totalIn: 0, totalOut: 0, currentStock: 0, status: 'SAFE'
                });
            }
        });

        masters.forEach(m => {
            if(m.kodeBarang && stockMap.has(m.kodeBarang)) {
                const item = stockMap.get(m.kodeBarang);
                item.totalIn += parseFloat(m.penerimaan) || 0;
                item.totalOut += parseFloat(m.distribusi) || 0;
            }
        });

        return Array.from(stockMap.values()).map(item => {
            item.currentStock = item.totalIn - item.totalOut;
            if (item.currentStock <= item.safeStock) item.status = 'CRIT';
            else if (item.currentStock <= item.reorderPoint) item.status = 'WARN';
            return item;
        });
    }

    createTransaction(data) {
        const id = AppUtils.generateUUID();
        const audit = AppUtils.getAuditTrail();
        const row = [
            id, data.tanggal || new Date(), data.noDokumen || '-',
            data.kodeBarang, data.namaBarang, data.kategori || '-',
            data.satuan || '-', parseFloat(data.penerimaan) || 0,
            parseFloat(data.distribusi) || 0, data.keterangan || '-',
            audit.updatedAt, audit.updatedBy
        ];
        this.repo.appendRow(row);
        AppUtils.invalidateCache(AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME);
        return { id, ...data };
    }
    
}