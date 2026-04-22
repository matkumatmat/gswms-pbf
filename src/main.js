// src/main.js
const DomainRegistry = {
  'getCustomers': {
    factory: () => new CustomerService(new CustomerRepo()),
    cacheGroup: AppConfig.DB_CUSTOMER_SHEET_NAME // Menghubungkan ke "CUSTOMER"
  },
  
  'getLookupShippingEmbalage': {
    factory: () => new LookupShippingEmbalageService(new LookupShippingEmbalageRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME
  },
  'getShippingLabels': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_LABEL_SHEET_NAME
  },
  'getConstantShippingEmbalage': {
    factory: () => new ShippingEmbalageService(new MasterShippingEmbalageRepo(), new ConstantShippingEmbalageRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME
  },
  'getEmbalageDashboard': {
    factory: () => new ShippingEmbalageService(new MasterShippingEmbalageRepo(), new ConstantShippingEmbalageRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME,
    method: 'getDashboardStats'
  },
  'getDashboardAnalytics': {
    factory: () => new AnalyticsService(),
    method: 'getDashboardAnalytics'
  },

  'updatePrintStatus': { factory: () => new ShippingLabelService(new ShippingLabelRepo()) },
  'getBatchLookup': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getPaginatedData',
    defaultSchema: 'table'
  },
  'getShortBatchLookup': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getShortBatchLookup',
    defaultSchema: 'short'
  },
  'getBatchDetail': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getDetail',
    defaultSchema: 'detail'
  },
  'queryBatch': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'query'
  },
  'getActiveReceivedBatches': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getActiveReceivedBatches',
    defaultSchema: 'short'
}
};
const PostRegistry = {
  'createShippingLabel': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'create'
  },
  'updatePrintStatus': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'updatePrintStatus'
  },
  
  'getBatchDetail': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    method: 'getDetail'
  },
  'generateBatchRecordSheet': {
    factory: () => new BatchRecordService(new BatchRecordRepo()),
    method: 'generateSheet' 
  },
  'getBatchHistory': {
    factory: () => new BatchRecordService(new BatchRecordRepo()),
    method: 'getHistory'
  },
  'createCustomer': {
    factory: () => new CustomerService(new CustomerRepo()),
    method: 'create'
  },
  'createEmbalageTransaction': {
    factory: () => new ShippingEmbalageService(new MasterShippingEmbalageRepo(), new ConstantShippingEmbalageRepo()),
    method: 'createTransaction'
  },
  'getBatchHistoryV2': {
    factory: () => new TransactionHistoryService(new TransactionHistoryRepo()),
    method: 'getHistory'
  },
  'generateBatchRecordSheetV2': {
    factory: () => {
      const historyRepo = new TransactionHistoryRepo();
      const historyService = new TransactionHistoryService(historyRepo);
      return new BatchDocumentGeneratorService(historyService);
    },
    method: 'generateDocument' 
  },
  // -----------------------------------
};
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;

    if (!action) throw new Error("Action (method) tidak ditentukan!");

    const route = PostRegistry[action];
    if (!route) throw new Error(`Endpoint POST '${action}' tidak ditemukan!`);

    const service = route.factory();
    const result = service[route.method](contents.data);

    return responseHelper({
      status: "success",
      message: "Data berhasil disimpan dan cache telah di-invalidate",
      data: result
    });

  } catch (error) {
    return responseHelper({
      status: "error",
      message: error.toString()
    });
  }
}
function processUiRequest(action, payload) {
  try {
    const route = PostRegistry[action];
    if (!route) throw new Error(`Action '${action}' tidak ditemukan di Registry!`);

    const service = route.factory();
    const result = service[route.method](payload);
    const responsePayload = { status: "success", data: result };
    return JSON.parse(JSON.stringify(responsePayload));
  } catch (error) {
    console.error("UI Request Error: " + error.toString());
    throw new Error(error.toString()); 
  }
}
function fetchUiData(action, reqPage = 1, reqLimit = 50) {
  try {
    const route = DomainRegistry[action];
    if (action === 'getNavbarLogo') {
      return { status: "success", data: getNavbarLogo() };
    }
    if (!route) {
      throw new Error(`Endpoint action '${action}' tidak terdaftar di Registry!`);
    }
    const service = route.factory();
    const pageNum = parseInt(reqPage) || 1;
    const limitNum = parseInt(reqLimit) || 50;
    const methodName = route.method || 'getPaginatedData';
    const data = service[methodName](pageNum, limitNum);
    const responsePayload = { 
      status: "success", 
      count: data.length,
      data: data 
    };
    return JSON.parse(JSON.stringify(responsePayload));
  } catch (error) {
    return { 
      status: "error", 
      message: error.toString() 
    };
  }
}
function responseHelper(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const method = params.method || 'client';
    if (method === 'fetch') {
      const action = params.action;
      if (action === 'ping') {
        return responseHelper({ status: "success", message: "API V2 is running & Scalable!" });
      }
      if (action === 'getNavbarLogo') {
        return responseHelper({ status: "success", data: getNavbarLogo() });
      }
      const route = DomainRegistry[action];
      if (!route) {
        throw new Error(`Endpoint action '${action}' tidak valid atau belum terdaftar di DomainRegistry!`);
      }
      const props = PropertiesService.getScriptProperties();
      const versionKey = `VERSION_${route.cacheGroup}`;
      let currentVersion = props.getProperty(versionKey);
      if (!currentVersion) {
        currentVersion = Date.now().toString();
        props.setProperty(versionKey, currentVersion);
      }
      const service = route.factory();
      const methodName = route.method || 'getPaginatedData'; 
      let cacheKey = '';
      let pageNum = 1;
      let limit = null;
      if (methodName === 'getDetail') {
        cacheKey = `CACHE_DETAIL_${action}_V${currentVersion}_ID_${params.id || params.batch}`;
      } else {
        pageNum = parseInt(params.page) || 1; 
        limit = params.limit || null; 
        cacheKey = `CACHE_${action}_V${currentVersion}_P${pageNum}_L${limit || 'default'}`;
      }
      const cache = CacheService.getScriptCache();
      const cachedString = cache.get(cacheKey);
      if (cachedString) {
        const cachedData = JSON.parse(cachedString);
        const dataCount = Array.isArray(cachedData) ? cachedData.length : (cachedData ? 1 : 0);
        return responseHelper({ 
          status: "success", 
          source: `cache (v.${currentVersion})`, 
          count: dataCount, 
          data: cachedData 
        });
      }
      let data;
      if (methodName === 'getDetail') {
        data = service[methodName](params); 
      } else {
        data = service[methodName](pageNum, limit);
      }
      try {
        const jsonString = JSON.stringify(data);
        if (jsonString.length < 90000) {
          cache.put(cacheKey, jsonString, 600); // 10 menit
        }
      } catch (cacheError) {
        console.warn("Bypass cache, payload melebihi limit.");
      }
      const finalCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
      return responseHelper({ 
        status: "success", 
        source: `spreadsheet (v.${currentVersion})`, 
        count: finalCount, 
        data: data 
      });    
    }

    if (method === 'client') {
      const reqPage = params.page || 'home';
      const template = HtmlService.createTemplateFromFile('src/clients/components/ui/MainLayout');      
      const validPages = {
        'shipping_label': 'src/client/pages/shipping_label/ShippingLabel',
        'detail': 'src/client/pages/product_detail/ProductDetail',
        'product': 'src/clients/pages/product/Product', // <--- ARAHIN KE FILE BARU LU
        'home': 'src/clients/pages/Home',
        'master_customer': 'src/client/pages/customer/CustomerList',
        'add_customer': 'src/client/pages/customer/CustomerForm',
        'fefo_center': 'src/client/pages/fefo/FefoCenter',
        'embalage': 'src/clients/pages/embalage/ShippingEmbalage',
      };

      if (validPages[reqPage]) {
        template.pageContent = validPages[reqPage];
        
        // Injeksi parameter khusus buat halaman detail
        if (reqPage === 'detail' || reqPage === 'product') {
          template.urlParamId = params.id || null;
          template.urlParamBatch = params.batch || null;
        }
      } else {
        template.pageContent = 'src/clients/pages/Error404';
      }
      return template.evaluate()
        .setTitle('PBF Manage')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

  } catch (error) {
    const method = (e && e.parameter && e.parameter.method) ? e.parameter.method : 'client';
    
    if (method === 'fetch') {
      return responseHelper({ 
        status: "error", 
        message: error.toString(),
        stack: error.stack
      });
    } else {
      return HtmlService.createHtmlOutput(`
        <div style="font-family:sans-serif; padding: 20px; color: red;">
          <h2>System Error</h2>
          <p>${error.toString()}</p>
        </div>
      `);
    }
  }
}
function getNavbarLogo() {
  return `https://drive.google.com/thumbnail?id=${AppConfig.LOGO_DRIVE_ID}&sz=w200`;
}
function fetchUiDataQuery(action, params = {}) {
  try {
    const route = DomainRegistry[action];
    if (!route) throw new Error(`Endpoint '${action}' tidak terdaftar!`);

    const service = route.factory();
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 50;
    const schema = params.schema || route.defaultSchema || 'table';
    const filters = params.filters || {};
    
    const methodName = route.method || 'getPaginatedData';
    let data;
    
    if (methodName === 'query') {
      data = service.query({ page, limit, schema, filters });
    } else {
      const filterConfig = filters.sysStatusIn ? { allowedStatuses: filters.sysStatusIn } : null;
      data = service[methodName](page, limit, schema, filterConfig);
    }

    return JSON.parse(JSON.stringify({ 
      status: "success", 
      count: Array.isArray(data) ? data.length : 1,
      data: data 
    }));

  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}