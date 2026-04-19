// src/domain/product/product/ProductService.js

class ProductService extends BaseService {
    constructor(repo) {
        super(repo, 500);
        // Product mungkin nggak perlu join, atau join dengan kategori lain
        this.jsonFields = []; // Product mungkin nggak punya JSON fields
    }

    // Kalau Product nggak perlu join, method-nya jadi super simpel:
    getAllProducts(schemaName = 'table') {
        const rawData = this.repo.getAllProductRaw();
        const processed = this._processJsonFields(rawData); // Langsung process, nggak perlu join
        const filtered = this._applyFilters(processed, { allowedStatuses: null }, 'kodeBarang');
        return this._project(filtered, schemaName);
    }
    
    getPaginatedData(page = 1, limit = null, schemaName = 'table', filterConfig = null) {
        const limitNum = limit ? parseInt(limit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limitNum);
        const processed = this._processJsonFields(rawData);
        const filtered = this._applyFilters(processed, filterConfig, 'kodeBarang');
        return this._project(filtered, schemaName);
    }

    // Tambah method khusus Product kalau perlu
    getByKodeBarang(kodeBarang, schemaName = 'detail') {
        const rawData = this.repo.getAllProductRaw();
        const products = AppUtils.mapArrayToObject(rawData, ProductRepo.TABLE_KEYS);
        const found = products.find(p => p.kodeBarang === kodeBarang || p.kodeBarangNew === kodeBarang);
        if (!found) return null;
        return this._project(this._processJsonFields([found])[0], schemaName);
    }
}