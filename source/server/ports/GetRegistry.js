const GetsRegistryV2 = (function() {
  const handlers = {
    // customer handlers (new)
    /**
     * @action getMasterCustomers
     * @method GET
     * @description Mendapatkan semua data customer, difilter berdasarkan statues (default mengecualikan DELETED).
     * @param {Object} params
     * @param {string} [params.statues=ACTIVE] - Filter status (contoh: ACTIVE, INACTIVE, DELETED)
     * @returns {Array<Object>} data - Array objek customer sesuai schema `customerMasterTable`
     *
     * @config master.customer
     * @spreadsheetId 1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM
     * @spreadsheetName DATA MASTER
     * @sheetName PMS_CUSTOMER
     * @headerRow 5
     * @startRow 6
     * @globalLastSyncAtCell B1
     * @globalUpdatedAtCell B2
     * @globalUpdatedByCell B3
     * @cacheGroup MASTER_1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM_PMS_CUSTOMER
     * @fieldMapping
     *   id              : ID
     *   createdAt       : CREATED AT
     *   updatedAt       : UPDATED AT
     *   updatedBy       : UPDATED BY
     *   statues         : STATUES
     *   typeKonsumen    : TYPE KONSUMEN
     *   namaKonsumen    : NAMA KONSUMEN
     *   kotaCabang      : KOTA/CABANG
     *   namaSingkat     : NAMA SINGKAT
     *   slug            : SLUG
     *   provinsi        : PROVINSI
     *   kota            : KOTA
     *   alamat          : ALAMAT
     *   pic             : PIC
     *   kontak          : KONTAK
     *   maps            : MAPS
     *   jarak           : JARAK (KM)
     *   kategori        : KATEGORI
     */    
    getMasterCustomers: function (params) {
      var service = CustomerMasterFactory.getService();
      var statues = params.statues || 'ACTIVE';
      return service.getAll(statues);
    },

    /**
     * @action getMasterCustomerById
     * @method GET
     * @description Mendapatkan satu data customer berdasarkan ID.
     * @param {Object} params
     * @param {string} params.id - UUID customer
     * @returns {Object|null} - Objek customer sesuai schema `customerMasterDetail` atau null
     *
     * @config Sama seperti getMasterCustomers
     */
    getMasterCustomerById: function (params) {
      var service = CustomerMasterFactory.getService();
      return service.getById(params.id);
    },

    /**
     * @action getMasterCustomersPaginated
     * @method GET
     * @description Mendapatkan data customer secara paginasi.
     * @param {Object} params
     * @param {number} params.page - Nomor halaman (1‑based)
     * @param {number} params.limit - Jumlah item per halaman
     * @param {string} [params.statues=ACTIVE]
     * @returns {Object} { data, page, limit, total, totalPages }
     *
     * @config Sama seperti getMasterCustomers
     */    
    getMasterCustomersPaginated: function (params) {
      var service = CustomerMasterFactory.getService();
      return service.getPaginated(params.page, params.limit, params.statues);
    },

    /**
     * @action getMasterCustomersByField
     * @method GET
     * @description Mencari customer berdasarkan field standar dan value.
     * @param {Object} params
     * @param {string} params.field - Nama field standar (camelCase sesuai fieldMapping)
     * @param {string} params.value - Nilai yang dicari (case‑insensitive)
     * @returns {Array<Object>} - Array objek customer sesuai schema
     *
     * @config Sama seperti getMasterCustomers
     */    
    getMasterCustomersByField: function (params) {
      var service = CustomerMasterFactory.getService();
      return service.findByField(params.field, params.value);
    },    
    //product handlers
    getMasterProducts: function (params) {
      const service = ProductMasterFactory.getService();
      const statues = params.statues || 'ACTIVE';
      return service.getAll(statues);
    },
    getMasterProductById: function (params) {
      const service = ProductMasterFactory.getService();
      return service.getById(params.id);
    },
    getMasterProductsPaginated: function (params) {
      const service = ProductMasterFactory.getService();
      return service.getPaginated(params.page, params.limit, params.statues);
    },
    getMasterProductsByField: function (params) {
      const service = ProductMasterFactory.getService();
      return service.findByField(params.field, params.value);
    },    
    // batch handlers (new)
    getMasterBatches: function (params) {
      const service = BatchMasterFactory.getService();
      const statues = params.statues || 'ACTIVE';
      return service.getAll(statues);
    },
    getMasterBatchById: function (params) {
      const service = BatchMasterFactory.getService();
      return service.getById(params.id);
    },
    getMasterBatchByBatchNo: function (params) {  // masih bisa digunakan jika perlu
      const service = BatchMasterFactory.getService();
      const all = service.getAll(params.statues);  // bisa juga langsung filter
      return all.find(b => b.batch === params.batchNo) || null;
    },
    getMasterBatchesByProductId: function (params) {
      const service = BatchMasterFactory.getService();
      const all = service.getAll(params.statues);
      return all.filter(b => b.productId === params.productId);
    },
    getMasterBatchesByField: function (params) {
      const service = BatchMasterFactory.getService();
      return service.findByField(params.field, params.value);
    },
    getMasterBatchesPaginated: function (params) {
      const service = BatchMasterFactory.getService();
      return service.getPaginated(params.page, params.limit, params.statues);
    },  
    // shipping embalage handlers
    getMasterShippingEmbalages: function(params) {
      var service = ShippingEmbalageMasterFactory.getService();
      var statues = params.statues || 'ACTIVE';
      return service.getAll(statues);
    },
    getMasterShippingEmbalageById: function(params) {
      var service = ShippingEmbalageMasterFactory.getService();
      return service.getById(params.id);
    },
    getMasterShippingEmbalagesPaginated: function(params) {
      var service = ShippingEmbalageMasterFactory.getService();
      return service.getPaginated(params.page, params.limit, params.statues);
    },
    getMasterShippingEmbalagesByField: function(params) {
      var service = ShippingEmbalageMasterFactory.getService();
      return service.findByField(params.field, params.value);
    }, 
    // product embalage handlers
    getMasterProductEmbalages: function(params) {
      var service = ProductEmbalageMasterFactory.getService();
      return service.getAll(params.statues || 'ACTIVE');
    },
    getMasterProductEmbalageById: function(params) {
      var service = ProductEmbalageMasterFactory.getService();
      return service.getById(params.id);
    },
    getMasterProductEmbalagesPaginated: function(params) {
      var service = ProductEmbalageMasterFactory.getService();
      return service.getPaginated(params.page, params.limit, params.statues);
    },
    getMasterProductEmbalagesByField: function(params) {
      var service = ProductEmbalageMasterFactory.getService();
      return service.findByField(params.field, params.value);
    },    
    
    

    // transactional data handler (ALL_DIST, ALL_RCV, ALL_CONS)
    getTransactional: function(params) {
      const year = params.year || ApplicationConfig.dataSources.transactional[0].year; // default ke tahun pertama
      const sheet = params.sheet;
      if (!sheet) throw new Error('Missing sheet parameter');
      const service = TransactionalFactory.getService(year, sheet);
      if (params.id) {
        return service.getById(params.id);
      }
      if (params.type) {
        return service.getPaginated(params.page, params.limit, params.type);
      }
      return service.getPaginated(params.page, params.limit);
    },

    // history transactional data handler
    // Product history handlers
    getProductHistory: function(params) {
      var adapter    = new ProductHistoryReaderAdapter();
      var repository = new ProductHistoryRepository(adapter);
      var service    = new ProductHistoryService(repository);

      var filterBy  = params.filterBy;
      var value     = params.value;
      var fieldName = params.fieldName;
      var schema    = params.schema || 'productHistoryDefault';

      // construct options dari flat params — sama persis polanya
      var options = {
        startDate: params.startDate,
        endDate:   params.endDate,
        limit:     params.limit ? parseInt(params.limit) : null
      };

      var result;
      switch (filterBy) {
        case 'batch':
          result = service.getHistoryByBatch(value, options); break;
        case 'kodeBarang':
          result = service.getHistoryByKodeBarang(value, options); break;
        case 'namaKonsumen':
          result = service.getHistoryByNamaKonsumen(value, options); break;
        case 'field':
          result = service.getHistoryByField(fieldName, value, options); break;
        default:
          if (fieldName) result = service.getHistoryByField(fieldName, value, options);
      }

      return SchemaUtils.projectArrayToSchema(result || [], schema);
    },

    // batch record handler
    // downloadBatchRecord: function(params) {
    //   var batchNo = params.batchNo;
    //   if (!batchNo) throw new Error('batchNo required');
    //   var adapter = new BatchRecordAdapter();
    //   var repo = new BatchRecordRepository(adapter);
    //   var service = new BatchRecordService(repo);
    //   var blob = service.generateXlsx(batchNo);
    //   return { _type: 'file', blob: blob };
    // },
    // downloadBatchRecord: function(params) {
    //   var batchNo = params.batchNo;
    //   if (!batchNo) throw new Error('batchNo required');
    //   var batchAdapter = new BatchSheetAdapter();          // <-- tambahan
    //   var adapter = new BatchRecordAdapter();
    //   var repo = new BatchRecordRepository(adapter);
    //   var service = new BatchRecordService(repo, batchAdapter); // parameter baru
    //   var blob = service.generateXlsx(batchNo);
    //   return { _type: 'file', blob: blob };
    // },  

    // batch record (new)
    // exportBatchRecord: function(params) {
    //   const batchNo = params.batchNo;
    //   const format  = params.format || 'xlsx';   // xlsx, json, pdf (nanti)

    //   const repo    = new BatchRecordRepository(new BatchRecordAdapter());
    //   const service = new BatchRecordService(repo, BatchMasterFactory, ArchieveFactory);
    //   const result  = service.export(batchNo, format, {});

    //   // Jika format json, kita bisa langsung kembalikan isi file
    //   if (format === 'json') {
    //     const fileMeta = ArchieveFactory.getService().getFileMetadata(result.id);
    //     return {
    //       _type: 'json',
    //       data: {
    //         id: result.id,
    //         url: result.url,
    //         fileName: result.fileName,
    //         content: Utilities.newBlob(Utilities.base64Decode(fileMeta.base64), 'application/json').getDataAsString()
    //       }
    //     };
    //   }
    //   // Untuk xlsx dll: streaming file binary
    //   return {
    //     _type: 'file',
    //     blob: DriveApp.getFileById(result.id).getBlob()
    //   };
    // },

    // exportBatchRecord: function(params) {
    //   var batchNo = params.batchNo;
    //   var format  = params.format || 'xlsx';

    //   var repo    = new BatchRecordRepository(new BatchRecordAdapter());
    //   var service = new BatchRecordService(repo, BatchMasterFactory, ArchieveFactory);
    //   var result  = service.export(batchNo, format, {});

    //   // Untuk JSON, kita bisa kembalikan langsung konten file
    //   if (format === 'json') {
    //     var content = Utilities.newBlob(
    //       Utilities.base64Decode(result.blob.getBytes()),   // result.blob adalah Blob json
    //       'application/json'
    //     ).getDataAsString();
    //     return {
    //       status: 'success',
    //       data: {
    //         id: result.id,
    //         url: result.url,
    //         fileName: result.fileName,
    //         content: content
    //       }
    //     };
    //   }

    //   // Untuk XLSX, kirim langsung blob yang sudah kita punya (tanpa baca Drive)
    //   return {
    //     _type: 'file',
    //     blob: result.blob
    //   };
    // },  
    
    // batch record v3
    // exportBatchRecord: function(params) {
    //   var batchNo = params.batchNo;
    //   var format = params.format || 'xlsx';

    //   var repo    = new BatchRecordRepository(new BatchRecordAdapter());
    //   var service = new BatchRecordService(repo, BatchMasterFactory, ArchieveFactory);
    //   var blob    = service.generateBlob(batchNo, format);

    //   if (format === 'json') {
    //     var content = blob.getDataAsString();
    //     return {
    //       status: 'success',
    //       data: {
    //         metadata: JSON.parse(content).metadata,
    //         transactions: JSON.parse(content).transactions
    //       }
    //     };
    //   }

    //   // Untuk xlsx, kirim langsung sebagai file download
    //   return {
    //     _type: 'file',
    //     blob: blob
    //   };
    // },

    // batch record v4
    // exportBatchRecord: function(params) {
    //   var batchNo = params.batchNo;
    //   var format  = params.format || 'xlsx';

    //   var repo    = new BatchRecordRepository(new BatchRecordAdapter());
    //   var service = new BatchRecordService(repo, BatchMasterFactory, ArchieveFactory);
    //   var blob    = service.generateBlob(batchNo, format);

    //   if (format === 'json') {
    //     var content = blob.getDataAsString();
    //     return {
    //       status: 'success',
    //       data: JSON.parse(content)
    //     };
    //   }

    //   // Untuk xlsx, langsung return file download
    //   return ContentService
    //     .createTextOutput(blob.getBytes())
    //     .setMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    //     .downloadAsFile('BatchRecord_' + batchNo + '.xlsx');
    // },    

    // batch record v5
    exportBatchRecord: function(params) {
      var batchNo = params.batchNo;
      var format  = params.format || 'xlsx';

      var repo    = new BatchRecordRepository(new BatchRecordAdapter());
      var service = new BatchRecordService(repo, BatchMasterFactory, ArchieveFactory);

      if (format === 'json') {
        var blob = service.generateBlob(batchNo, 'json');
        return {
          status: 'success',
          data: JSON.parse(blob.getDataAsString())
        };
      }

      // Untuk xlsx (atau format file lainnya)
      var result = service.generateAndArchive(batchNo, format);
      // Bagikan file agar bisa diunduh tanpa login
      try {
        var file = DriveApp.getFileById(result.id);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        result.url = file.getUrl();  // URL yang bisa diakses siapa pun
      } catch(e) {
        Logger.log('Gagal set sharing: ' + e.message);
      }

      return {
        status: 'success',
        data: {
          id: result.id,
          url: result.url,
          fileName: result.fileName,
          format: result.format
        }
      };
    },    
    
    // serveBatchRecordFile: function(params) {
    //   var id = params.id;   // ID file dari Archieve
    //   if (!id) throw new Error('Missing file id');
    //   var blob = DriveReader.getFileBlob(id);
    //   return {
    //     _type: 'file_direct',   // tipe baru yang langsung mengembalikan blob
    //     blob: blob
    //   };
    // },  


    // shipping embalage handlers

    getShippingEmbalage: function(params) {
      var year = params.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      var page = params.page || 1;
      var limit = params.limit || 100;
      return service.getPaginated(page, limit);
    },
    getShippingEmbalageById: function(params) {
      if (!params.id) throw new Error('Missing id');
      var year = params.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      return service.getById(params.id);
    },
    getShippingEmbalageByField: function(params) {
      if (!params.field || !params.value) throw new Error('Missing field or value');
      var year = params.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      return service.getByField(params.field, params.value);
    },

    // history shipping embalage handlers
    getShippingEmbalageHistory: function(params) {
      var adapter = new HistoryShippingEmbalageReaderAdapter();
      var repository = new HistoryShippingEmbalageRepository(adapter);
      var service = new HistoryShippingEmbalageService(repository);
      var filterBy = params.filterBy; // 'noDokumen', 'kodeBarang', 'namaBarang', 'field', 'year'
      var value = params.value;
      var options = {
        startDate: params.startDate,
        endDate: params.endDate,
        limit: params.limit ? parseInt(params.limit) : null
      };
      var schema = params.schema || 'shippingEmbalageHistoryDefault';
      var data;
      switch (filterBy) {
        case 'noDokumen':
          data = service.getHistoryByNoDokumen(value, options);
          break;
        case 'kodeBarang':
          data = service.getHistoryByKodeBarang(value, options);
          break;
        case 'namaBarang':
          data = service.getHistoryByNamaBarang(value, options);
          break;
        case 'field':
          if (!params.fieldName) throw new Error('fieldName required for field filter');
          data = service.getHistoryByField(params.fieldName, value, options);
          break;
        case 'year':
          data = service.getHistoryByYear(value, options);
          break;
        default:
          data = service.getAllHistory(options);
      }
      return SchemaUtils.projectArrayToSchema(data, schema);
    },

    // ─── Product Embalage handlers ───────────────────────────────────────────────
    getProductEmbalage: function(params) {
      var year  = params.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      return service.getPaginated(
        parseInt(params.page)  || 1,
        parseInt(params.limit) || 100
      );
    },

    getProductEmbalageById: function(params) {
      if (!params.id) throw new Error('Missing id');
      var year    = params.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      return service.getById(params.id);
    },

    getProductEmbalageByField: function(params) {
      if (!params.field || !params.value) throw new Error('Missing field or value');
      var year    = params.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      return service.findByField(params.field, params.value);
    },

    getProductEmbalageHistory: function(params) {
      var adapter    = new HistoryProductEmbalageReaderAdapter();
      var repository = new HistoryProductEmbalageRepository(adapter);
      var service    = new HistoryProductEmbalageService(repository);

      var filterBy  = params.filterBy;
      var value     = params.value;
      var options   = {
        startDate: params.startDate || null,
        endDate:   params.endDate   || null,
        limit:     params.limit ? parseInt(params.limit) : null
      };
      var schema = params.schema || 'productEmbalageHistoryDefault';

      var data;
      switch (filterBy) {
        case 'batch':
          data = service.getHistoryByBatch(value, options);        break;
        case 'kodeBarang':
          data = service.getHistoryByKodeBarang(value, options);   break;
        case 'namaBarang':
          data = service.getHistoryByNamaBarang(value, options);   break;
        case 'namaKonsumen':
          data = service.getHistoryByNamaKonsumen(value, options); break;
        case 'field':
          if (!params.fieldName) throw new Error('fieldName required for field filter');
          data = service.getHistoryByField(params.fieldName, value, options); break;
        case 'year':
          data = service.getHistoryByYear(value, options);         break;
        default:
          data = service.getAllHistory(options);
      }

      return SchemaUtils.projectArrayToSchema(data, schema);
    },

    // Archieve handlers
    getArchieves: function(params) {
      var service = ArchieveFactory.getService();
      var all = service.repo.getAll();
      var page = parseInt(params.page) || 1;
      var limit = parseInt(params.limit) || 50;
      var start = (page - 1) * limit;
      var paginated = all.slice(start, start + limit);
      return {
        data: SchemaUtils.projectArrayToSchema(paginated, 'archieveTable'),
        page: page,
        limit: limit,
        total: all.length,
        totalPages: Math.ceil(all.length / limit)
      };
    },
    getArchieveById: function(params) {
      var service = ArchieveFactory.getService();
      var record = service.getFileMetadata(params.id);
      return SchemaUtils.projectToSchema(record, 'archieveDetail');
    },
    downloadArchieveFile: function(params) {
      var service = ArchieveFactory.getService();
      return service.downloadFile(params.id);
    }    

    };

  return {
    getHandler: function(action) { return handlers[action]; },
    execute: function(action, params) {
      var handler = handlers[action];
      if (!handler) throw new Error('Action ' + action + ' tidak terdaftar di GetRegistry');
      return handler(params || {});
    }
  };

})();