/**
 * test_FilterBatch_Modular.gs
 * Filter modular + Schema projection.
 * - Filter by any joined field (default: exact match, case-insensitive)
 * - Result diproyeksikan ke SCHEMA_DROPDOWN (interface)
 * - Debug log untuk tracking filter yang apply
 */

// ============================================================================
// 1. SCHEMA INTERFACE
// ============================================================================
var SCHEMA_DROPDOWN = [
  'id','kodeBarangOld','kodeBarangNew','namaDagang','namaBarangErp',
  'batch','expireDate','perBucket','status','sysStatus','infoUrl'
];

// Mapping untuk field yang namanya beda antara schema vs data asli
var SCHEMA_FIELD_MAP = {
  'expireDate': 'expiryDate'  // schema: expireDate, data: expiryDate
};

// ============================================================================
// 2. KONSTANTA MAPPING DATA (EXACT COPY DARI SERVICE)
// ============================================================================
var BATCH_TABLE_KEYS = [
  'id', 'productId', 'alokasi', 'sektor', 'kodeBarang', 'namaDagang', 'batch',
  'manufacturingDate', 'expiryDate', 'status', 'rslBulan', 'sysStatus', 'nie',
  'fotoUrl', 'infoUrl', 'dimensionPLT', 'berat', 'catatanFisik', 'noDokPenerimaan',
  'rslHari', 'perBucket', 'createdAt', 'updatedAt', 'updatedBy', 'notes'
];

var PRODUCT_KEYS = [
  'id', 'kodeBarangOld', 'kodeBarangNew', 'namaDagang', 'namaBarangErp', 
  'kategori', 'jenis', 'tahun', 'hjp', 'het', 'updatedAt', 'updatedBy'
];

// ============================================================================
// 3. DATA LOADER & JOIN
// ============================================================================
function _mapArrayToObject(rawArray, keys) {
  return rawArray.map(function(row) {
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i]] = row[i];
    }
    return obj;
  });
}

function _joinBatchWithProduct(rawBatch, rawProduct) {
  var products = _mapArrayToObject(rawProduct, PRODUCT_KEYS);
  var productMap = {};
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    if (p.id) productMap[p.id] = p;
  }
  
  var batches = _mapArrayToObject(rawBatch, BATCH_TABLE_KEYS);
  
  var result = [];
  for (var i = 0; i < batches.length; i++) {
    var batch = batches[i];
    var master = productMap[batch.productId] || {};
    
    result.push({
      id: batch.id,
      productId: batch.productId,
      alokasi: batch.alokasi,
      sektor: batch.sektor,
      kodeBarang: batch.kodeBarang,
      namaDagang: batch.namaDagang,
      batch: batch.batch,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      status: batch.status,
      rslBulan: batch.rslBulan,
      sysStatus: batch.sysStatus,
      nie: batch.nie,
      fotoUrl: batch.fotoUrl,
      infoUrl: batch.infoUrl,
      dimensionPLT: batch.dimensionPLT,
      berat: batch.berat,
      catatanFisik: batch.catatanFisik,
      noDokPenerimaan: batch.noDokPenerimaan,
      rslHari: batch.rslHari,
      perBucket: batch.perBucket,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      updatedBy: batch.updatedBy,
      notes: batch.notes,
      kodeBarangOld: master.kodeBarangOld || '-',
      kodeBarangNew: master.kodeBarangNew || '-',
      namaBarangDagang: master.namaDagang || '-',
      namaBarangErp: master.namaBarangErp || '-',
      kategori: master.kategori || '-',
      jenis: master.jenis || '-',
      hjp: parseFloat(master.hjp) || 0,
      het: parseFloat(master.het) || 0
    });
  }
  return result;
}

function _loadJoinedData(limit) {
  var batchRepo = new BatchLookupRepo();
  var productRepo = new ProductRepo();
  var rawBatch = batchRepo.getPaginatedRawData(1, limit || 2000);
  var rawProduct = productRepo.getAllProductRaw();
  return _joinBatchWithProduct(rawBatch, rawProduct);
}

// ============================================================================
// 4. SCHEMA PROJECTION (INTERFACE)
// ============================================================================
function projectToSchema(item) {
  var projected = {};
  for (var i = 0; i < SCHEMA_DROPDOWN.length; i++) {
    var schemaField = SCHEMA_DROPDOWN[i];
    var dataField = SCHEMA_FIELD_MAP[schemaField] || schemaField;
    projected[schemaField] = item[dataField] !== undefined ? item[dataField] : null;
  }
  return projected;
}

function projectArrayToSchema(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    result.push(projectToSchema(arr[i]));
  }
  return result;
}

// ============================================================================
// 5. FILTER ENGINE - SIMPLE & DEBUGGABLE
// ============================================================================
function _isEmpty(value) {
  return value === null || value === undefined || value === '';
}

function _matchesFilter(itemValue, filterValue, operator) {
  if (_isEmpty(filterValue)) return true;
  if (_isEmpty(itemValue)) return false;
  
  var op = operator || 'eq';
  
  if (op === 'eq' || op === 'exact') {
    return String(itemValue).toUpperCase().trim() === String(filterValue).toUpperCase().trim();
  }
  if (op === 'neq' || op === 'not') {
    return String(itemValue).toUpperCase().trim() !== String(filterValue).toUpperCase().trim();
  }
  if (op === 'contains') {
    return String(itemValue).toUpperCase().indexOf(String(filterValue).toUpperCase().trim()) !== -1;
  }
  if (op === 'startswith') {
    return String(itemValue).toUpperCase().indexOf(String(filterValue).toUpperCase().trim()) === 0;
  }
  if (op === 'gte' || op === '>=') {
    return Number(itemValue) >= Number(filterValue);
  }
  if (op === 'lte' || op === '<=') {
    return Number(itemValue) <= Number(filterValue);
  }
  if (op === 'gt' || op === '>') {
    return Number(itemValue) > Number(filterValue);
  }
  if (op === 'lt' || op === '<') {
    return Number(itemValue) < Number(filterValue);
  }
  
  return String(itemValue).toUpperCase().trim() === String(filterValue).toUpperCase().trim();
}

function createFilterPipeline(filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return function() { return true; };
  }
  
  return function(item) {
    if (!item) return false;
    
    for (var field in filters) {
      if (filters.hasOwnProperty(field)) {
        var rule = filters[field];
        var filterValue, operator;
        
        if (typeof rule === 'object' && rule !== null) {
          filterValue = rule.value !== undefined ? rule.value : rule;
          operator = rule.operator || 'eq';
        } else {
          filterValue = rule;
          operator = 'eq';
        }
        
        if (!_isEmpty(filterValue)) {
          var itemValue = item[field];
          if (!_matchesFilter(itemValue, filterValue, operator)) {
            return false;
          }
        }
      }
    }
    return true;
  };
}

// ============================================================================
// 6. MAIN RUNNER
// ============================================================================
function runModularFilter(config) {
  var dataLimit = config.dataLimit || 2000;
  var rawLimit = config.rawLimit || 50;
  var filters = config.filters || {};
  var useSchema = config.useSchema !== false;
  
  Logger.log('DEBUG: Loading data with limit=' + dataLimit);
  var allData = _loadJoinedData(dataLimit);
  Logger.log('DEBUG: Total joined records=' + allData.length);
  
  Logger.log('DEBUG: Creating filter pipeline with filters=' + JSON.stringify(filters));
  var pipeline = createFilterPipeline(filters);
  
  Logger.log('DEBUG: Applying filter...');
  var filtered = [];
  for (var i = 0; i < allData.length; i++) {
    if (pipeline(allData[i])) {
      filtered.push(allData[i]);
    }
  }
  Logger.log('DEBUG: Filtered count=' + filtered.length);
  
  var sumHjp = 0;
  for (var j = 0; j < filtered.length; j++) {
    sumHjp += Number(filtered[j].hjp) || 0;
  }
  
  var rawResult = filtered;
  if (useSchema) {
    Logger.log('DEBUG: Projecting to schema, fields=' + SCHEMA_DROPDOWN.join(','));
    rawResult = projectArrayToSchema(filtered);
  }
  if (rawLimit && rawResult.length > rawLimit) {
    rawResult = rawResult.slice(0, rawLimit);
  }
  
  return {
    rawResult: rawResult,
    summary: {
      totalSource: allData.length,
      matched: filtered.length,
      returned: rawResult.length,
      sumHjp: sumHjp,
      appliedFilters: Object.keys(filters),
      schemaProjected: useSchema
    }
  };
}

// ============================================================================
// 7. ENTRY POINTS - CONTOH CONFIG
// ============================================================================
function test_filter_simple_exact() {
  var config = {
    dataLimit: 2000,
    rawLimit: 10,
    useSchema: true,
    filters: {
      status: 'RECEIVED',
      sysStatus: 'ACTIVE'
    }
  };
  var result = runModularFilter(config);
  Logger.log(JSON.stringify(result));
  return result;
}

function test_filter_by_batch() {
  var config = {
    dataLimit: 100,
    rawLimit: 20,
    useSchema: true,
    filters: {
      batch: '4016'
    }
  };
  var result = runModularFilter(config);
  Logger.log(JSON.stringify(result));
  return result;
}

function test_filter_with_operator() {
  var config = {
    dataLimit: 2000,
    rawLimit: 30,
    useSchema: true,
    filters: {
      sektor: { value: 'PBF', operator: 'eq' },
      rslBulan: { value: 3, operator: 'gte' },
      namaBarangDagang: { value: 'VAKSIN', operator: 'contains' }
    }
  };
  var result = runModularFilter(config);
  Logger.log(JSON.stringify(result));
  return result;
}

function test_filter_no_schema() {
  var config = {
    dataLimit: 100,
    rawLimit: 5,
    useSchema: false,
    filters: {
      sysStatus: 'ANOMALI'
    }
  };
  var result = runModularFilter(config);
  Logger.log(JSON.stringify(result));
  return result;
}

function test_filter_empty() {
  var config = {
    dataLimit: 100,
    rawLimit: 10,
    useSchema: true,
    filters: {}
  };
  var result = runModularFilter(config);
  Logger.log(JSON.stringify(result));
  return result;
}