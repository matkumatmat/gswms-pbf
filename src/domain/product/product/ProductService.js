// src/domain/product/product/ProductService.js

class ProductService {
    constructor(repo) {
        this.repo = repo;
        this.defaultLimit = 500;
        
        // Sesuaikan sama urutan 10 Kolom yang lu kasih!
        this.tableKeys = [
            'id', 'kodeBarang', 'kodeBarangNew','namaDagang', 'namaBarangNew', 
            'kategori', 'jenis', 'tahun', 'hjp,','het', 
            'updatedAt', 'updatedBy'
        ];
    }

    getAllProducts() {
        const rawData = this.repo.getAllProductRaw();
        const products = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return this._processJsonFields(products.filter(e => e.kodeBarang !== null && e.kodeBarang !== ''));
    }
    
    getPaginatedData(page = 1, requestedLimit = null) {
        const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limit);
        const products = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return this._processJsonFields(products.filter(e => e.kodeBarang !== null && e.kodeBarang !== ''));
    }

    _processJsonFields(items) {
        return items.map(item => {
            if (item.hjphet) {
                item.hjphet = AppUtils.safeParseJson(item.hjphet);
            }
            return item;
        });
    }
}