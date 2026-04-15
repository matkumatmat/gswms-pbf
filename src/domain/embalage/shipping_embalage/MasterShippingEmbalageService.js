// src/domain/embalage/shipping_embalage/MasterShippingEmbalageService.js

class MasterShippingEmbalageService {
    constructor(MasterShippingEmbalageRepo) {
        this.repo = MasterShippingEmbalageRepo;
        this.tableKeys = [
            'id',
            'tanggal',
            'noDokumen',
            'kodeBarang',
            'namaBarang',
            'kategori',
            'satuan',
            'penerimaan',
            'distribusi',
            'keterangan',
            'updatedAt',
            'updatedBy'
        ];
    }


    getAllMasterShippingEmbalage() {
        const rawData = this.repo.getAllMasterShippingEmbalageRaw();
        const MasterShippingEmbalages = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return MasterShippingEmbalages.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
    }

    getPaginatedData(page = 1, requestedLimit = null) {
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
    const rawData = this.repo.getPaginatedRawData(page, limit);
    const MasterShippingEmbalages = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    return MasterShippingEmbalages.filter(e => e.kodeBarang !== null && e.kodeBarang !== '');
  }
}