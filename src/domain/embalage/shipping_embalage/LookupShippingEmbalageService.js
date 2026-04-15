// src/domain/embalage/shipping_embalage/LookupShippingEmbalageService.js

class LookupShippingEmbalageService {
    constructor(lookupShippingEmbalageRepo) {
        this.repo = lookupShippingEmbalageRepo;
        this.tableKeys = [
            'id',
            'kodeBarang',
            'namaBarang',
            'aliasErp',
            'kategori',
            'satuan',
            'keterangan',
            'safeStock',
            'reorderPoint',
            'updatedAt',
            'updatedBy'
        ];
    }


    getAllLookupShippingEmbalage() {
        const rawData = this.repo.getAllLookupShippingEmbalageRaw();
        const lookupShippingEmbalages = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return lookupShippingEmbalages.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
    }

    getPaginatedData(page = 1, requestedLimit = null) {
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
    const rawData = this.repo.getPaginatedRawData(page, limit);
    const lookupShippingEmbalages = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    return lookupShippingEmbalages.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
  }
}