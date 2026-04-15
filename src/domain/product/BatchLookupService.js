// src/domain/product/BatchLookupService.js

class BatchLookupService {
    constructor(repo) {
        this.repo = repo;
        this.defaultLimit = 500;
        this.tableKeys = [
            'id', 'kategori', 'alokasi', 'sektor',
            'kodeBarang', 'namaBarangErp', 'namaBarangDagang', 'batch',
            'manufacturingDate', 'expiryDate', 'status', 'rslBulan',
            'sysStatus', 'nie', 'fotoUrl', 'infoUrl', 'dimensionPLT',
            'berat', 'catatanFisik', 'noDokPenerimaan', 'rslHari',
            'perBucket', 'createdAt', 'updatedAt', 'updatedBy',
            'notes'
        ];
        this.shortKeys = ['id', 'kodeBarang', 'namaBarangDagang',
            'batch','expiryDate', 'perBucket'
        ];

        this.fotoUrlKeys = [
            'idDrive', 'idUuid', 'folderPath', 'fileName', 'type', 'url', 'base64'
        ]

    }

    getAllBatchLookup() {
        const rawData = this.repo.getAllBatchLookupRaw();
        const batchLookups = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        return batchLookups.filter(e => e.batch !== null && e.batch !== '');
    }
    
    getPaginatedData(page = 1, requestedLimit = null) {
    const limit = requestedLimit ? parseInt(requestedLimit) : this.defaultLimit;
    const rawData = this.repo.getPaginatedRawData(page, limit);
    const batchLookups = AppUtils.mapArrayToObject(rawData, this.tableKeys);
    return batchLookups.filter(e => e.batch !== null && e.batch !== '');
    }

    getShortBatchLookup(page =1, requestedLimit = null) {
        const limit = requestedLimit ? parseInt(requestedLimit) : 5000;
        const rawData = this.repo.getPaginatedRawData(page, limit);
        const fullBatchLookups = AppUtils.mapArrayToObject(rawData, this.tableKeys);
        const validBatchLookups = fullBatchLookups.filter(e => e.batch !== null && e.batch !== '');        
        return validBatchLookups.map(fullObj => {
            let simpleObj = {};
            this.shortKeys.forEach(key => {
                simpleObj[key] = fullObj[key]
            })
            return simpleObj;
        });
    }


}