const PostsRegistryV2 = (function() {
  const handlers = {
    // customer handlers
    // moved to new methods below
    // createCustomer: function(payload, user) {
    //   var service = new CustomerService(new CustomerRepository(new CustomerSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.createCustomer(payload);
    // },
    // updateCustomer: function(payload, user) {
    //   var service = new CustomerService(new CustomerRepository(new CustomerSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.updateCustomer(payload.id, payload.data);
    // },
    // deleteCustomer: function(payload, user) {
    //   var service = new CustomerService(new CustomerRepository(new CustomerSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.deleteCustomer(payload.id);
    // },

    // product handlers
    createMasterCustomer: function (payload, user) {
      var service = CustomerMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.create(payload);
    },

    updateMasterCustomer: function (payload, user) {
      var service = CustomerMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },

    deleteMasterCustomer: function (payload, user) {
      var service = CustomerMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },    

    // product handlers
    // createProduct: function(payload, user) {
    //   var service = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.createProduct(payload);
    // },
    // updateProduct: function(payload, user) {
    //   var service = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.updateProduct(payload.id, payload.data);
    // },
    // deleteProduct: function(payload, user) {
    //   var service = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   if (user) service.setCurrentUser(user);
    //   return service.deleteProduct(payload.id);
    // },

    // product handlers
    createMasterProduct: function (payload, user) {
      const service = ProductMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.create(payload);
    },
    updateMasterProduct: function (payload, user) {
      const service = ProductMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },
    deleteMasterProduct: function (payload, user) {
      const service = ProductMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },    

    // batch handlers
    // moved to new methods below
    // createBatch: function(payload, user) {
    //   var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
    //   if (user) batchService.setCurrentUser(user);
    //   return batchService.createBatch(payload);
    // },
    // updateBatch: function(payload, user) {
    //   var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
    //   if (user) batchService.setCurrentUser(user);
    //   return batchService.updateBatch(payload.id, payload.data);
    // },
    // deleteBatch: function(payload, user) {
    //   var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
    //   if (user) batchService.setCurrentUser(user);
    //   return batchService.deleteBatch(payload.id);
    // },
    // createAttachment: function(payload, user) {
    //   var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
    //   if (user) batchService.setCurrentUser(user);
    //   return batchService.createAttachment(payload.batchId, payload.data);
    // },
    // updateAttachment: function(payload, user) {
    //   var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
    //   var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
    //   if (user) batchService.setCurrentUser(user);
    //   return batchService.updateAttachment(payload.attachId, payload.data);
    // },

    // batch handlers (new)
    createMasterBatch: function (payload, user) {
      const service = BatchMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.create(payload);
    },
    updateMasterBatch: function (payload, user) {
      const service = BatchMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },
    deleteMasterBatch: function (payload, user) {
      const service = BatchMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },   
    
    createMasterShippingEmbalages: function(payload, user) {
      var service = ShippingEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.create(payload);
    },
    updateMasterShippingEmbalages: function(payload, user) {
      var service = ShippingEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },
    deleteMasterShippingEmbalages: function(payload, user) {
      var service = ShippingEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },    

    // product embalage handlers
    createMasterProductEmbalage: function(payload, user) {
      var service = ProductEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.create(payload);
    },
    updateMasterProductEmbalage: function(payload, user) {
      var service = ProductEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },
    deleteMasterProductEmbalage: function(payload, user) {
      var service = ProductEmbalageMasterFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },    



    // hitory and transactional handlers
    // transactional handlers
    createTransactional: function(payload, user) {
      const { year, sheet, data } = payload;
      if (!year || !sheet) throw new Error('Year and sheet required');
      const service = TransactionalFactory.getService(year, sheet);
      if (user) service.setCurrentUser(user);
      return service.create(data);
    },
    updateTransactional: function(payload, user) {
      const { year, sheet, id, data } = payload;
      if (!year || !sheet || !id) throw new Error('Year, sheet, and id required');
      const service = TransactionalFactory.getService(year, sheet);
      if (user) service.setCurrentUser(user);
      return service.update(id, data);
    },
    deleteTransactional: function(payload, user) {
      const { year, sheet, id } = payload;
      if (!year || !sheet || !id) throw new Error('Year, sheet, and id required');
      const service = TransactionalFactory.getService(year, sheet);
      if (user) service.setCurrentUser(user);
      return service.delete(id);
    },


    // product receiving handlers
    createProductReceiving: function (payload, user) {
      const year = payload.year || String(new Date().getFullYear());
      const service = ProductReceivingFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.create(payload.data);
    },

    updateProductReceiving: function (payload, user) {
      const year = payload.year || String(new Date().getFullYear());
      const service = ProductReceivingFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },

    deleteProductReceiving: function (payload, user) {
      const year = payload.year || String(new Date().getFullYear());
      const service = ProductReceivingFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },    

    // shipping embalage handlers
    createShippingEmbalage: function(payload, user) {
      var year = payload.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.create(payload.data);
    },
    updateShippingEmbalage: function(payload, user) {
      if (!payload.id) throw new Error('Missing id');
      var year = payload.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },
    deleteShippingEmbalage: function(payload, user) {
      if (!payload.id) throw new Error('Missing id');
      var year = payload.year || String(new Date().getFullYear());
      var service = TransactionalShippingEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },


    // Product Embalage handlers
    createProductEmbalage: function(payload, user) {
      var year    = payload.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.create(payload.data);
    },

    updateProductEmbalage: function(payload, user) {
      if (!payload.id) throw new Error('Missing id');
      var year    = payload.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.update(payload.id, payload.data);
    },

    deleteProductEmbalage: function(payload, user) {
      if (!payload.id) throw new Error('Missing id');
      var year    = payload.year || String(new Date().getFullYear());
      var service = TransactionalProductEmbalageFactory.getService(year);
      if (user) service.setCurrentUser(user);
      return service.delete(payload.id);
    },
    
    // archieve handlers
    uploadArchieveFile: function(payload, user) {
      var service = ArchieveFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.uploadFile(payload);
    },
    updateArchieveMetadata: function(payload, user) {
      var service = ArchieveFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.updateFileMetadata(payload.id, payload.data);
    },
    deleteArchieveFile: function(payload, user) {
      var service = ArchieveFactory.getService();
      if (user) service.setCurrentUser(user);
      return service.deleteFile(payload.id);
    },
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
    
  };

  return {
    getHandler: function(action) { return handlers[action]; },
    execute: function(action, payload, user) {
      var handler = handlers[action];
      if (!handler) throw new Error('Action ' + action + ' tidak terdaftar di PostRegistry');
      return handler(payload || {}, user);
    }
  };
})();