// src/domain/product/product/ProductService.js

class ProductServices {
    constructor(repo) {
        this.repo = repo;
        this.defaultLimit = 500;
        
        // THE FIX: Typo koma dkk udah bersih!
        this.tableKeys = [
            'id', 'kodeBarang', 'kodeBarangNew', 'namaDagang', 'namaBarangNew', 
            'kategori', 'jenis', 'tahun', 'hjp', 'het', 
            'updatedAt', 'updatedBy'
        ];
    }

    getAllProducts() {
        const rawData = this.repo.getAllProductRaw();
        const products = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return products.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
    }
    
    getPaginatedData(page = 1, requestedLimit = null) {
        const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
        const rawData = this.repo.getPaginatedRawData(page, limit);
        const products = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return products.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
    }
}