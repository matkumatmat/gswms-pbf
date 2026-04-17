// src/main.js

/**
 * REGISTRY DOMAIN: Daftarkan semua endpoint dan inisialisasi servicenya di sini.
 * Format diubah jadi Object agar router tahu harus ngecek versi Cache dari Sheet mana.
 */
const DomainRegistry = {
  'getCustomers': {
    factory: () => new CustomerService(new CustomerRepo()),
    cacheGroup: AppConfig.DB_CUSTOMER_SHEET_NAME // Menghubungkan ke "CUSTOMER"
  },
  
  // Domain Shipping Embalage (Lookup)
  'getLookupShippingEmbalage': {
    factory: () => new LookupShippingEmbalageService(new LookupShippingEmbalageRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME
  },

  // Domain Shipping Embalage (Master)
  'getMasterShippingEmbalage': {
    factory: () => new MasterShippingEmbalageService(new MasterShippingEmbalageRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME
  },

  // Domain Shipping Label
  'getShippingLabels': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    cacheGroup: AppConfig.DB_SHIPPING_LABEL_SHEET_NAME
  },

  // Domain Batch Lookup
  'getBatchLookup': {
    factory: () => new BatchLookupService(new BatchLookupRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME
  },

  'getShortBatchLookup': {
    factory: () => new BatchLookupService(new BatchLookupRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getShortBatchLookup'
  },

  'updatePrintStatus': { factory: () => new ShippingLabelService(new ShippingLabelRepo()) },

'getBatchDetail': {
    factory: () => new BatchLookupService(new BatchLookupRepo()),
    cacheGroup: AppConfig.DB_BATCH_LOOKUP_SHEET_NAME,
    method: 'getDetail'
  }


  // Nanti product begini juga:
  // 'getProducts': {
  //   factory: () => new ProductService(new ProductRepo()),
  //   cacheGroup: AppConfig.DB_PRODUCT_SHEET_NAME
  // }
};

// src/main.js

/**
 * REGISTRY UNTUK WRITE OPERATIONS (doPost)
 */
const PostRegistry = {
  'createShippingLabel': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'create'
  },
  'updatePrintStatus': {
    factory: () => new ShippingLabelService(new ShippingLabelRepo()),
    method: 'updatePrintStatus'
  },
  // --- ENDPOINT BARU UNTUK PENCARIAN SPESIFIK ---
  'getBatchDetail': {
    factory: () => new BatchLookupService(new BatchLookupRepo()),
    method: 'getDetail'
  },
  'generateBatchRecordSheet': {
    factory: () => new BatchRecordService(new BatchRecordRepo()),
    method: 'generateSheet' // Mengarah ke fungsi pembuat GSheet
  }

  // Nanti tambah: 'createProduct': { ... }
};

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;

    if (!action) throw new Error("Action (method) tidak ditentukan!");

    const route = PostRegistry[action];
    if (!route) throw new Error(`Endpoint POST '${action}' tidak ditemukan!`);

    // Inisialisasi Service dan panggil method-nya
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

/**
 * JEMBATAN UNTUK NATIVE UI (google.script.run)
 * Fungsi ini dipanggil langsung dari JavaScript di HTML
 */
function processUiRequest(action, payload) {
  try {
    const route = PostRegistry[action];
    if (!route) throw new Error(`Action '${action}' tidak ditemukan di Registry!`);

    const service = route.factory();
    const result = service[route.method](payload);

    // Bungkus dalam satu variabel biar bisa disanitasi
    const responsePayload = { status: "success", data: result };

    // ================================================================
    // WAJIB: Sanitasi untuk membunuh Objek Date agar tidak null di UI
    // ================================================================
    return JSON.parse(JSON.stringify(responsePayload));

  } catch (error) {
    console.error("UI Request Error: " + error.toString());
    throw new Error(error.toString()); 
  }
}

/**
 * JEMBATAN UNTUK MENGAMBIL DATA KE UI (READ/GET)
 * Dipanggil dari google.script.run di frontend
 */
function fetchUiData(action, reqPage = 1, reqLimit = 50) {
  try {
    const route = DomainRegistry[action];
    if (!route) {
      throw new Error(`Endpoint action '${action}' tidak terdaftar di Registry!`);
    }

    const service = route.factory();
    const pageNum = parseInt(reqPage) || 1;
    const limitNum = parseInt(reqLimit) || 50;

    // Tarik data dari Service
    const methodName = route.method || 'getPaginatedData';
    // const data = service.getPaginatedData(pageNum, limitNum);
    const data = service[methodName](pageNum, limitNum);

    // Siapkan payload balikan
    const responsePayload = { 
      status: "success", 
      count: data.length,
      data: data 
    };

    // ================================================================
    // THE MAGIC TRICK: Sanitasi objek biar ga ada Date Object bawaan GAS
    // Biar google.script.run ga panik dan ga ngirim null ke frontend
    // ================================================================
    return JSON.parse(JSON.stringify(responsePayload));

  } catch (error) {
    return { 
      status: "error", 
      message: error.toString() 
    };
  }
}

/**
 * Standarisasi Response Format
 */
function responseHelper(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}


// GANTI FUNGSI INCLUDE INI DI main.js
function include(filename) {
  // Pake createTemplateFromFile -> evaluate, biar Nested Include bisa dieksekusi!
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

// function doGet(e) {
//   try {
//     const params = e ? e.parameter : {};
//     const action = params.action;
//     const reqPage = params.page || 'home'; // Default ke home kalau kosong

//     // 1. ROUTER HALAMAN UI
//     if (!action) {
//       const template = HtmlService.createTemplateFromFile('src/client/ui/Layout');
      
//       // Mapping nama parameter page ke lokasi file HTML-nya
//       if (reqPage === 'shipping_label') {
//         template.pageContent = 'src/client/pages/shipping_label/ShippingLabel';
//       } else {
//         template.pageContent = 'src/client/pages/main/Home'; // Nanti lo bikin Home.html di sini
//       }

//       return template.evaluate()
//         .setTitle('PBF Manage')
//         .addMetaTag('viewport', 'width=device-width, initial-scale=1') // WAJIB BUAT MOBILE
//         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
//     }

//     if (action === 'ping') {
//       return responseHelper({ status: "success", message: "API V2 is running & Scalable!" });
//     }

//     // 1. DYNAMIC ROUTER: Cari action di Registry
//     const route = DomainRegistry[action];
//     if (!route) {
//       throw new Error(`Endpoint action '${action}' tidak valid atau belum terdaftar!`);
//     }

//     // 2. CEK VERSI GLOBAL TERBARU DARI PROPERTIES
//     const props = PropertiesService.getScriptProperties();
//     const versionKey = `VERSION_${route.cacheGroup}`;
//     let currentVersion = props.getProperty(versionKey);
    
//     // Kalau belum pernah ada yang ngedit (belum ada versi), set versi 1
//     if (!currentVersion) {
//       currentVersion = Date.now().toString();
//       props.setProperty(versionKey, currentVersion);
//     }

//     // 3. Inisialisasi Service secara on-demand
//     const service = route.factory();

//     // 4. Tangkap Parameter Pagination
//     // 2. Ganti nama variabelnya jadi pageNumber
//     const pageNumber = parseInt(reqPage) || 1; 
//     const limit = params.limit || null; 

//     // 5. CACHE LAYER (DENGAN VERSIONING)
//     // Pastikan di sini panggilnya pageNumber
//     const cacheKey = `CACHE_${action}_V${currentVersion}_P${pageNumber}_L${limit || 'default'}`;
//     const cache = CacheService.getScriptCache();
//     const cachedString = cache.get(cacheKey);

//     if (cachedString) {
//       const cachedData = JSON.parse(cachedString);
//       return responseHelper({ 
//         status: "success", 
//         source: `cache (v.${currentVersion})`, 
//         count: cachedData.length, 
//         data: cachedData 
//       });
//     }

//     // // 6. Eksekusi Data Layer jika Cache kosong atau versi basi
//     // // Pastikan di sini juga panggilnya pageNumber
//     // const data = service.getPaginatedData(pageNumber, limit);

//     // // 7. Simpan ke Cache selama 6 jam (21600 detik)
//     // cache.put(cacheKey, JSON.stringify(data), 21600);

//     // return responseHelper({ 
//     //   status: "success", 
//     //   source: `spreadsheet (v.${currentVersion})`, 
//     //   count: data.length, 
//     //   data: data 
//     // });

// // 6. Eksekusi Data Layer jika Cache kosong atau versi basi
//     // Pastikan di sini juga panggilnya pageNumber
//     // const data = service.getPaginatedData(pageNumber, limit);
//     // 6. Eksekusi Data Layer jika Cache kosong atau versi basi
//     const methodName = route.method || 'getPaginatedData';
//     const data = service[methodName](pageNumber, limit);

//     // 7. Simpan ke Cache selama 6 jam (21600 detik)
//     // Penanganan khusus jika ukuran data melebihi batas maksimal CacheService (100 KB)
//     try {
//       const jsonString = JSON.stringify(data);
//       // Pengecekan kasar panjang string (1 karakter kira-kira 1-2 bytes).
//       // Batas aman diset di sekitar 90.000 karakter sebelum dilempar ke cache.
//       if (jsonString.length < 90000) {
//         cache.put(cacheKey, jsonString, 600); // 600 detik = 10 menit
//       }
//     } catch (cacheError) {
//       // Abaikan error cache (misal argumen terlalu besar), lanjutkan untuk me-return data
//       console.warn("Bypass cache, payload melebihi limit batas ukuran GAS.");
//     }

//     return responseHelper({ 
//       status: "success", 
//       source: `spreadsheet (v.${currentVersion})`, 
//       count: data.length, 
//       data: data 
//     });    

//   } catch (error) {
//     return responseHelper({ 
//       status: "error", 
//       message: error.toString(),
//       stack: error.stack
//     });
//   }
// }


function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const method = params.method || 'client';
    
    // ==========================================
    // ROUTER A: API BACKEND (method=fetch)
    // ==========================================
    if (method === 'fetch') {
      const action = params.action;
      
      if (action === 'ping') {
        return responseHelper({ status: "success", message: "API V2 is running & Scalable!" });
      }

      const route = DomainRegistry[action];
      if (!route) {
        throw new Error(`Endpoint action '${action}' tidak valid atau belum terdaftar di DomainRegistry!`);
      }

      // Cek Versi Global untuk Cache
      const props = PropertiesService.getScriptProperties();
      const versionKey = `VERSION_${route.cacheGroup}`;
      let currentVersion = props.getProperty(versionKey);
      
      if (!currentVersion) {
        currentVersion = Date.now().toString();
        props.setProperty(versionKey, currentVersion);
      }

      const service = route.factory();
      // DEKLARASI DI ATAS BIAR GAK ERROR INITIALIZATION
      const methodName = route.method || 'getPaginatedData'; 

      // Setup Variabel Cache & Parameter
      let cacheKey = '';
      let pageNum = 1;
      let limit = null;

      if (methodName === 'getDetail') {
        // Kalau narik detail, Cache dipisah berdasarkan ID barang
        cacheKey = `CACHE_DETAIL_${action}_V${currentVersion}_ID_${params.id || params.batch}`;
      } else {
        // Kalau narik list, Cache berdasarkan Pagination
        pageNum = parseInt(params.page) || 1; 
        limit = params.limit || null; 
        cacheKey = `CACHE_${action}_V${currentVersion}_P${pageNum}_L${limit || 'default'}`;
      }

      // Cek apakah data ada di Cache
      const cache = CacheService.getScriptCache();
      const cachedString = cache.get(cacheKey);

      if (cachedString) {
        const cachedData = JSON.parse(cachedString);
        // Hitung count (kalau array pakai length, kalau object detail berarti 1)
        const dataCount = Array.isArray(cachedData) ? cachedData.length : (cachedData ? 1 : 0);
        
        return responseHelper({ 
          status: "success", 
          source: `cache (v.${currentVersion})`, 
          count: dataCount, 
          data: cachedData 
        });
      }

      // EKSEKUSI DATA KE SPREADSHEET (Jika Cache Kosong)
      let data;
      if (methodName === 'getDetail') {
        // Oper seluruh parameter URL (termasuk id/batch) ke dalam getDetail()
        data = service[methodName](params); 
      } else {
        // Oper parameter pagination ke getPaginatedData()
        data = service[methodName](pageNum, limit);
      }

      // Simpan hasil ke Cache
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

    // ==========================================
    // ROUTER B: FRONTEND WEB APP (method=client)
    // ==========================================
    if (method === 'client') {
      const reqPage = params.page || 'home';
      const template = HtmlService.createTemplateFromFile('src/client/ui/Layout');
      
      // Mapping halaman UI
      if (reqPage === 'shipping_label') {
        template.pageContent = 'src/client/pages/shipping_label/ShippingLabel';
      } else if (reqPage === 'detail' || reqPage === 'product') {
        template.pageContent = 'src/client/pages/product_detail/ProductDetail';
        
        // Injeksi parameter ke scriptlet HTML
        template.urlParamId = params.id || null;
        template.urlParamBatch = params.batch || null;
      } else {
        template.pageContent = 'src/client/pages/main/Home'; 
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