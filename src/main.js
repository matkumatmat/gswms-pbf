// src/main.js

// ============================================================================
// 1. REGISTRY DATA (GET Requests)
// ============================================================================
const DomainRegistry = {
  'getCustomers': {
    factory: () => new CustomerService(new CustomerRepo()),
    cacheGroup: AppConfig.DB_CUSTOMER_SHEET_NAME 
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
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getDashboardAnalytics'
  },
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

// ============================================================================
// 2. REGISTRY MUTASI (POST Requests)
// ============================================================================
const PostRegistry = {
  'createShippingLabel': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'create',
    roles: ['ADMIN', 'OPERATOR']
  },
  'updatePrintStatus': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'updatePrintStatus',
    roles: ['ADMIN', 'OPERATOR']
  },
  'getBatchDetail': {
    factory: () => new BatchService(new BatchRepo(), new ProductRepo()),
    method: 'getDetail'
  },
  'createCustomer': {
    factory: () => new CustomerService(new CustomerRepo()),
    method: 'create',
    roles: ['ADMIN']
  },
  'createEmbalageTransaction': {
    factory: () => new ShippingEmbalageService(new MasterShippingEmbalageRepo(), new ConstantShippingEmbalageRepo()),
    method: 'createTransaction',
    roles: ['ADMIN', 'OPERATOR']
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
  'getSection2ProductDetail': {
    factory: () => new AnalyticsService(),
    method: 'getSection2ProductDetail'
  },
  'scheduledDailyStockSync': {
    factory: () => ({
      executeSync: () => {
        scheduledDailyStockSync(); 
        return { status: 'success', message: 'Sinkronisasi berhasil ditarik manual' };
      }
    }),
    method: 'executeSync'
  }
};

// ============================================================================
// 3. REGISTRY HALAMAN UI (Client Routes)
// ============================================================================
const PageRegistry = {
  // Format: 'nama_param_url': 'path/ke/file/html/tanpa/ekstensi'
  'dashboard': 'src/clients/pages/dashboard/AdvanceDashboard',
  'product': 'src/clients/pages/product/Product',
  'detail': 'src/clients/pages/product_detail/ProductDetail', 
  'shipping_label': 'src/clients/pages/shipping_label/ShippingLabel',
  'master_customer': 'src/clients/pages/customer/CustomerList',
  'add_customer': 'src/clients/pages/customer/CustomerForm',
  'fefo_center': 'src/clients/pages/fefo/FefoCenter',
  'embalage': 'src/clients/pages/embalage/ShippingEmbalage',
  'maindashboard': 'src/clients/pages/analytics/MainDashboard',
  'login': 'src/clients/pages/login/Login',
};

// ============================================================================
// 4. CORE CONTROLLERS
// ============================================================================

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const token = contents.token; // Kita tarik token dari frontend

    if (!action) throw new Error("Action (method) tidak ditentukan!");

    // 1. BYPASS KHUSUS UNTUK LOGIN
    if (action === 'loginAction') {
      const loginResult = AuthService.login(contents.data);
      return responseHelper({ status: "success", data: loginResult });
    }

    // 2. SATPAM RBAC: Validasi Token
    const activeUser = AuthService.validateToken(token);
    if (!activeUser) {
      throw new Error("Sesi telah habis atau akses ditolak! Silakan login ulang.");
    }

    const route = PostRegistry[action];
    if (!route) throw new Error(`Endpoint POST '${action}' tidak ditemukan!`);

    // (OPSIONAL: Kalau lu mau ngecek ROLE di sini, lu bisa tambahin pengecekan di route Registry)
    // if (route.requiredRole && route.requiredRole !== activeUser.role) throw new Error("Akses Ditolak: Bukan Hak Kamu!");

    const service = route.factory();
    
    // Injeksi user aktif ke dalam data biar service tau siapa yang lagi ngeksekusi
    if (typeof contents.data === 'object') {
      contents.data.__currentUser = activeUser;
    }

    const result = service[route.method](contents.data);

    // 3. GLOBAL LOGGING OTOMATIS (Bisa dipanggil di dalam Service lu, tapi buat trigger dasar bisa taruh sini)
    GlobalLogger.log(activeUser.name, "EXECUTE", action, "-", "-", "-");

    return responseHelper({
      status: "success",
      message: "Berhasil dieksekusi",
      data: result
    });

  } catch (error) {
    return responseHelper({ status: "error", message: error.toString() });
  }
}

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const method = params.method || 'client';

    if (method === 'fetch') {
      return handleApiGet(params);
    }

    if (method === 'client') {
      return handleClientRouting(params);
    }

  } catch (error) {
    const method = (e && e.parameter && e.parameter.method) ? e.parameter.method : 'client';
    if (method === 'fetch') {
      return responseHelper({ status: "error", message: error.toString(), stack: error.stack });
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

// ============================================================================
// 5. HELPER FUNCTIONS
// ============================================================================

function handleClientRouting(params) {
  const reqPage = params.page || 'maindashboard';
  const template = HtmlService.createTemplateFromFile('src/clients/components/ui/MainLayout');      

  // ========================================================
  // FIX DARI GUE: INJEKSI NAMA PAGE & URL KE FRONTEND
  // ========================================================
  template.activePage = reqPage;
  template.appUrl = ScriptApp.getService().getUrl();

  if (PageRegistry[reqPage]) {
    template.pageContent = PageRegistry[reqPage];
    
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

function handleApiGet(params) {
  const action = params.action;
  
  if (action === 'ping') return responseHelper({ status: "success", message: "API V2 is running & Scalable!" });
  if (action === 'getNavbarLogo') return responseHelper({ status: "success", data: getNavbarLogo() });
  
  const route = DomainRegistry[action];
  if (!route) throw new Error(`Endpoint action '${action}' tidak valid atau belum terdaftar di DomainRegistry!`);
  
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
    return responseHelper({ status: "success", source: `cache (v.${currentVersion})`, count: dataCount, data: cachedData });
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
  return responseHelper({ status: "success", source: `spreadsheet (v.${currentVersion})`, count: finalCount, data: data });    
}

function processUiRequest(action, payload) {
  try {

    // 1. LOGIN - satu-satunya yang special
    if (action === 'loginAction') {
      const loginResult = AuthService.login(payload); // payload langsung, bukan payload.data
      return JSON.parse(JSON.stringify({ status: "success", data: loginResult }));
    }

    // 2. ROUTE LOOKUP
    const route = PostRegistry[action];
    if (!route) throw new Error(`Action '${action}' tidak ditemukan di Registry!`);

    const service = route.factory();
    const result = service[route.method](payload); // payload langsung

    // 3. LOG MUTASI (opsional, keep kalau mau audit trail)
    if (!action.startsWith('get') && !action.startsWith('query')) {
      const entityId = (payload?.id) || (result?.id) || '-';
      GlobalLogger.log('Operator', action, "API_MUTASI", entityId, '-', JSON.stringify(payload) || '-');
    }

    return JSON.parse(JSON.stringify({ status: "success", data: result }));

  } catch (error) {
    console.error("processUiRequest Error: " + error.toString());
    return { status: "error", message: error.toString() };
  }
}

function fetchUiData(action, reqPage = 1, reqLimit = 50) {
  try {
    const route = DomainRegistry[action];
    if (action === 'getNavbarLogo') return { status: "success", data: getNavbarLogo() };
    if (!route) throw new Error(`Endpoint action '${action}' tidak terdaftar di Registry!`);
    
    const service = route.factory();
    const pageNum = parseInt(reqPage) || 1;
    // const limitNum = parseInt(reqLimit) || 50;
    const limitNum = parseInt(reqLimit) || null;
    const methodName = route.method || 'getPaginatedData';
    const data = service[methodName](pageNum, limitNum);
    
    return JSON.parse(JSON.stringify({ status: "success", count: data.length, data: data }));
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
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

    return JSON.parse(JSON.stringify({ status: "success", count: Array.isArray(data) ? data.length : 1, data: data }));
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

function responseHelper(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}
function getNavbarLogo() {
  return `https://drive.google.com/thumbnail?id=${AppConfig.LOGO_DRIVE_ID}&sz=w200`;
}