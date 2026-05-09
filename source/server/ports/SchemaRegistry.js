// source/server/ports/SchemaRegistry.js (tambahan)

SchemaRegistry = {
  // product schemas
  productMasterDropdown: ['id', 'kodeBarang', 'namaBarang'],
  productMasterTable: ['id', 'kodeBarang', 'namaBarang', 'kategori', 'jenis', 'tahun', 'hjp', 'het', 'statues'],
  productMasterDetail: ['id', 'createdAt', 'updatedAt', 'updatedBy', 'statues', 'year', 'kodeBarang', 'kodeBarangNew', 'namaBarang', 'namaBarangNew', 'kategori', 'jenis', 'satuan', 'suhu', 'hjp', 'het'] ,

  // product history schemas
  productHistoryDefault: [
  'tanggal', 'jenisTransaksi', 'noDokumen', 'namaKonsumen',
  'kotaCabang', 'batch', 'penerimaan', 'distribusi', 'keterangan'
  ],
  productHistoryDetail: [
    'id', 'tanggal', 'batch', 'kodeBarang', 'namaBarang',
    'penerimaan', 'distribusi', 'keterangan', 'sumberTahun', 'sumberType',
    'jenisTransaksi', 'noDokumen', 'placement', 'kondisiKemasan', 'noDok', 'kotaCabang', 'namaKonsumen'
  ],

  batchMasterDropdown: ['id', 'batch', 'namaBarang'],   // untuk dropdown ringan
  batchMasterTable: ['id', 'batch', 'namaBarang', 'kodeBarang', 'expireDate', 'statues'],
  batchMasterDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'statues',
    'SysStatus', 'productId', 'alokasi', 'sektor', 'kodeBarang', 'namaBarang',
    'batch', 'mfgDate', 'expireDate', 'status', 'rslBulan', 'rslHari',
    'nomorIzinEdar', 'dimensi', 'berat', 'perBucket', 'vvmStatus', 'notes',
    'catatanFisik', 'webUrl', 'recordUrl'
  ],

  // customer schemas
  customerMasterDropdown: ['id', 'namaKonsumen', 'kotaCabang'],
  customerMasterTable: [
    'id', 'namaKonsumen', 'kotaCabang', 'namaSingkat',
    'typeKonsumen', 'kategori', 'provinsi', 'statues'
  ],
  customerMasterDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'statues',
    'typeKonsumen', 'namaKonsumen', 'kotaCabang', 'namaSingkat',
    'slug', 'provinsi', 'kota', 'alamat', 'pic', 'kontak',
    'maps', 'jarak', 'kategori'
  ],

  // shipping embalage schemas
  shippingEmbalageMasterDropdown: ['id', 'kodeBarang', 'namaBarang'],
  shippingEmbalageMasterTable: [
    'id', 'kodeBarang', 'namaBarang', 'kategori', 'satuan', 'statues'
  ],
  shippingEmbalageMasterDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'statues',
    'kodeBarang', 'namaBarang', 'aliasErp', 'kategori', 'satuan',
    'keterangan', 'safetyStock', 'reorderPoint'
  ],
  // product embalage schemas
  productEmbalageMasterDropdown: ['id', 'kodeBarang', 'namaBarang'],
  productEmbalageMasterTable: [
    'id', 'kodeBarang', 'namaBarang', 'batch', 'expireDate', 'kategori', 'statues'
  ],
  productEmbalageMasterDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'statues',
    'kodeBarang', 'namaBarang', 'aliasErp', 'batch', 'expireDate',
    'kategori', 'satuan', 'keterangan', 'safetyStock', 'reorderPoint'
  ],  

  // batch record schemas
  batchRecordExport: [
    'tanggal',
    'namaKonsumen',
    'kotaCabang',
    'kodeBarang',
    'namaBarang',
    'batch',
    'nie',
    'penerimaan',
    'distribusi',
    'saldo'
  ],
  // Shipping Embalage schemas
  // shippingEmbalageTable: ['id', 'tanggal', 'noDokumen', 'kodeBarang', 'namaBarang', 'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'],
  // shippingEmbalageDetail: ['id', 'createdAt', 'updatedAt', 'updatedBy', 'tanggal', 'noDokumen', 'kodeBarang', 'namaBarang', 'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'],

  // Shipping Embalage History schemas
  shippingEmbalageHistoryDefault: [
    'tanggal', 'noDokumen', 'kodeBarang', 'namaBarang',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'
  ],
  shippingEmbalageHistoryDetail: [
    'id', 'tanggal', 'noDokumen', 'kodeBarang', 'namaBarang',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan',
    'tahun', 'jenisTransaksi', 'createdAt', 'updatedAt', 'updatedBy'
  ],


  
  // Product Embalage Transactional schemas
  productEmbalageTable: [
    'id', 'tanggal', 'noDok', 'namaKonsumen', 'kotaCabang',
    'kodeBarang', 'namaBarang', 'batch',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'
  ],
  productEmbalageDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'idPemb',
    'tanggal', 'noDok', 'namaKonsumen', 'kotaCabang',
    'alokasi', 'sektor', 'kodeBarang', 'namaBarang', 'batch', 'expireDate',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'
  ],

  // Product Embalage History schemas
  productEmbalageHistoryDefault: [
    'tanggal', 'noDok', 'namaKonsumen', 'kotaCabang',
    'kodeBarang', 'namaBarang', 'batch',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan'
  ],
  productEmbalageHistoryDetail: [
    'id', 'tanggal', 'noDok', 'namaKonsumen', 'kotaCabang',
    'alokasi', 'sektor', 'kodeBarang', 'namaBarang', 'batch', 'expireDate',
    'kategori', 'satuan', 'penerimaan', 'distribusi', 'catatan',
    'tahun', 'jenisTransaksi', 'createdAt', 'updatedAt', 'updatedBy'
  ],
  
  // Archieve schemas
  archieveDetail: [
    'id', 'createdAt', 'updatedAt', 'updatedBy', 'statues',
    'entityId', 'entityType', 'entityName', 'documentType',
    'fileName', 'fileSize', 'mimeType', 'driveFileId', 'driveFolderId',
    'url', 'thumbnailUrl', 'documentDate', 'expireDate', 'remarks',
    'tags', 'isPublic', 'notes'
  ],
  archieveTable: [
    'id', 'createdAt', 'fileName', 'documentType', 'entityType',
    'entityName', 'fileSize', 'url', 'statues'
  ]  
  
};