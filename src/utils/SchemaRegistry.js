// src/utils/SchemaRegistry.js

var SchemaRegistry = {
  // Dropdown: cuma butuh identitas dasar
  dropdown: ['id', 'batch', 'namaBarangDagang', 'expireDate'],
  
  // Table view: field utama untuk display
  table: [
    'id', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'namaBarangErp',
    'batch', 'expireDate', 'perBucket', 'status', 'sysStatus', 'sektor', 'alokasi'
  ],
  
  // Detail: hampir semua field untuk view lengkap
  detail: [
    'id', 'productId', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'namaBarangErp',
    'batch', 'manufacturingDate', 'expireDate', 'status', 'sysStatus', 'rslBulan', 'rslHari',
    'sektor', 'alokasi', 'perBucket', 'hjp', 'het', 'kategori', 'jenis',
    'fotoUrl', 'infoUrl', 'notes', 'createdAt', 'updatedAt', 'updatedBy'
  ],
  
  // Short: untuk legacy getShortBatchLookup
  short: ['id', 'productId', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'batch', 'expiryDate', 'perBucket'],
  
  // Export: null = return semua field tanpa projection
  export: null
};

// Mapping field schema -> field asli di joined object
var SchemaFieldMap = {
  'expireDate': 'expiryDate'
};

function projectToSchema(item, schemaName) {
  var schema = SchemaRegistry[schemaName];
  if (!schema || schema.length === 0) return item;
  
  var projected = {};
  for (var i = 0; i < schema.length; i++) {
    var schemaField = schema[i];
    var dataField = SchemaFieldMap[schemaField] || schemaField;
    projected[schemaField] = item[dataField] !== undefined ? item[dataField] : null;
  }
  return projected;
}

function projectArrayToSchema(items, schemaName) {
  if (!schemaName || !SchemaRegistry[schemaName]) return items;
  var result = [];
  for (var i = 0; i < items.length; i++) {
    result.push(projectToSchema(items[i], schemaName));
  }
  return result;
}