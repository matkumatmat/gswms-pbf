// src/domain/embalage/shipping_embalage/MasterShippingEmbalageRepo.js

class MasterShippingEmbalageRepo extends BaseRepository {
  constructor() {
    super(AppConfig.DB_SHIPPING_EMBALAGE_MASTER_ID, AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME);
    this.startRow = AppConfig.DB_SHIPPING_EMBALAGE_MASTER_START_ROW;
    }

    getAllShippingMasterEmbalageRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}