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
}