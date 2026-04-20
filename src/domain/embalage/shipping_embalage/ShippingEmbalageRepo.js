class ConstantShippingEmbalageRepo extends BaseRepository {
    constructor(){
        super(AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_ID, AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME);
        this.startRow = AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_START_ROW || 2;
    }

    static get TABLE_KEYS(){
        return [
            'id','kodeBarang','namaBarang','aliasErp',
            'kategori','satuan','keterangan','safeStock',
            'reorderPoint','updatedAt','updatedBy'
        ];
    }

    getAllLookupShippingEmbalageRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}

class MasterShippingEmbalageRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_SHIPPING_EMBALAGE_MASTER_ID, AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME);
        this.startRow = AppConfig.DB_SHIPPING_EMBALAGE_MASTER_START_ROW || 2;
    }

    static get TABLE_KEYS() {
        return [
            'id','tanggal','noDokumen','kodeBarang','namaBarang',
            'kategori','satuan','penerimaan','distribusi',
            'keterangan','updatedAt','updatedBy'
        ];
    }

    getAllMasterShippingEmbalageRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}