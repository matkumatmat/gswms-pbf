// src/domain/distribusi/master/DistribusiMasterRepo.js

 class DistribusiMasterRepo extends BaseRepository {
    constructor() {
        super(AppConfig.DB_MASTER)
    }
 }