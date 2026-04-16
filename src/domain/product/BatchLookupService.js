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

    /**
     * HELPER INTERNAL: Mem-parsing field yang berupa string JSON menjadi Object
     */
    _processJsonFields(items) {
        return items.map(item => {
            ['fotoUrl', 'infoUrl', 'dimensionPLT'].forEach(key => {
                if (item[key]) {
                    item[key] = AppUtils.safeParseJson(item[key]);
                }
            });
            return item;
        });
    }

    /**
     * FUNGSI BARU: Pencarian spesifik 1 baris berdasarkan parameter (id, batch, dll)
     */
    getDetail(payload) {
        if (!payload) throw new Error("Payload pencarian tidak ditemukan.");
        
        const { id, batch, kodeBarang } = payload;
        if (!id && !batch && !kodeBarang) {
            throw new Error("Kriteria pencarian kosong. Masukkan id, batch, atau kodeBarang.");
        }

        // Tarik semua raw data. (getValues sekali jalan itu sangat cepat di GAS)
        const rawData = this.repo.getAllBatchLookupRaw();
        const allData = AppUtils.mapArrayToObject(rawData, this.tableKeys);

        let found = null;

        // Prioritas pencarian
        if (id) {
            found = allData.find(e => e.id === id);
        } else if (batch) {
            found = allData.find(e => e.batch === batch);
        } else if (kodeBarang) {
            found = allData.find(e => e.kodeBarang === kodeBarang);
        }

        if (!found) return null;

        // Proses field JSON (foto, dimensi) sebelum dilempar ke frontend
        return this._processJsonFields([found])[0];
    }

}