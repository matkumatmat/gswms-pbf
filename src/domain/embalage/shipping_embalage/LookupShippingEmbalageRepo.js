// src/domain/embalage/shipping_embalage/LookupShippingEmbalageRepo.js

class LookupShippingEmbalageRepo extends BaseRepository {
  constructor() {
    super(AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_ID, AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME);
    this.startRow = AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_START_ROW;
    }

    getAllLookupShippingEmbalageRaw() {
        const rawData = this.getAllRawData();
        const skipCount = this.startRow > 0 ? this.startRow - 1 : 0;
        return rawData.slice(skipCount);
    }
}