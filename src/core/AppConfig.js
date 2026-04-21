// src/core/AppConfig.js

const AppConfig = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzlqoerdfGyCNPryzaxOvNZ0DutljadQOCM1EXzFr58e_OZwx4zimmzeLAoE3YYCNNS/exec",
//   WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxsJ6_3ajDsLjYKFKqwG_nuZxHAXzVi0-iwYUXKwTs/dev",
  LOGO_DRIVE_ID:'18xdVTIKD8A7zbwfrVzX03wTNGaZv8KBF',
  DRIVE_ARCHIEVE_FOLDER_ID: '1wHjMQYXS12VA7WyMfhqFlz06Aj6asbWh',
  DRIVE_ARCHIEVE_BATCH_RECORD_ID: '1tXAjYIVX7qldupfvXnZh4zpZRvHL3c9m',

  // TABEL REKAP STOK (Agregasi)
  DB_STOK_REKAP_SHEET_NAME: 'PM_STOK_REKAP',
  DB_STOK_COLD_REKAP_SHEET_NAME: 'PM_STOK_COLD_REKAP',

  // MANAGEMENT CUSTOMER LOOKUP DATA
  DB_CUSTOMER_LOOKUP_ID: '1_f130ciiAMSsE7E2GO2dQqdU__HDrfhN9o5rAqlfxTU',
  DB_CUSTOMER_SHEET_NAME: 'CUSTOMER',
  DB_CUSTOMER_TABLE_NAME: 'LOOKUP',
  DB_CUSTOMER_START_ROW: 2, 
  DB_CUSTOMER_ID_COL: 1, 
  DB_CUSTOMER_UPDATED_AT_COL: 13, // Kolom M untuk updatedAt
  DB_CUSTOMER_UPDATED_BY_COL: 14, // Kolom N untuk updatedBy

  // MANAGEMENT CUSTOMER LOOKUP DATA
  DB_LIBRARY_ARCHIEVE_LOOKUP_ID: '1aNeQJpsrXqLWAFKdbnR6ohT-SU1dbWtsf1m6wcaXYkI',
  DB_LIBRARY_ARCHIEVE_SHEET_NAME: 'LIBRARY_MASTER',
  DB_LIBRARY_ARCHIEVE_TABLE_NAME: 'LIBRARY',
  DB_LIBRARY_ARCHIEVE_START_ROW: 2, 
  DB_LIBRARY_ARCHIEVE_ID_COL: 1, 
  DB_LIBRARY_ARCHIEVE_GENERATED_AT_COL: 8, // Kolom H untuk updatedAt
  DB_LIBRARY_ARCHIEVE_UPDATED_AT_COL: 9, // Kolom I untuk updatedAt
  DB_LIBRARY_ARCHIEVE_UPDATED_BY_COL: 10, // Kolom J untuk updatedBy

  // MANAGEMENT PENUNJANG PENGIRIMAN LOOKUP DATA
  DB_SHIPPING_EMBALAGE_LOOKUP_ID: '1Bt-LGX1F1ZjRmWG0u_Bm0nUtcylDR4xBVLN_GxmuEG8',
  DB_SHIPPING_EMBALAGE_LOOKUP_SHEET_NAME: 'SHIPEMB_LOOKUP',
  DB_SHIPPING_EMBALAGE_LOOKUP_TABLE_NAME: 'LOOKUP',
  DB_SHIPPING_EMBALAGE_LOOKUP_START_ROW: 2, 
  DB_SHIPPING_EMBALAGE_LOOKUP_ID_COL: 1, 
  DB_SHIPPING_EMBALAGE_LOOKUP_UPDATED_AT_COL: 10, // Kolom J untuk updatedAt
  DB_SHIPPING_EMBALAGE_LOOKUP_UPDATED_BY_COL: 11, // Kolom K untuk updatedBy

  // MANAGEMENT PENUNJANG PENGIRIMAN MASTER DATA
  DB_SHIPPING_EMBALAGE_MASTER_ID: '1Bt-LGX1F1ZjRmWG0u_Bm0nUtcylDR4xBVLN_GxmuEG8',
  DB_SHIPPING_EMBALAGE_MASTER_SHEET_NAME: 'SHIPEMB_MASTER',
  DB_SHIPPING_EMBALAGE_MASTER_TABLE_NAME: 'MASTER',
  DB_SHIPPING_EMBALAGE_MASTER_START_ROW: 2, 
  DB_SHIPPING_EMBALAGE_MASTER_ID_COL: 1, 
  DB_SHIPPING_EMBALAGE_MASTER_UPDATED_AT_COL: 11, // Kolom K untuk updatedAt
  DB_SHIPPING_EMBALAGE_MASTER_UPDATED_BY_COL: 12, // Kolom L untuk updatedBy

  // MANAGEMENT PENUNJANG PENGIRIMAN MASTER DATA
  DB_SHIPPING_LABEL_ID: '1OTF96eCC_J2hduJ8EEkhLK7LOyE_4CG2ZBu-7l3xpqo',
  DB_SHIPPING_LABEL_SHEET_NAME: 'SHIPLBL_MASTER',
  DB_SHIPPING_LABEL_TABLE_NAME: 'LABEL_MASTER',
  DB_SHIPPING_LABEL_START_ROW: 2, 
  DB_SHIPPING_LABEL_ID_COL: 1, 
  DB_SHIPPING_LABEL_UPDATED_AT_COL: 14, // Kolom N untuk updatedAt
  DB_SHIPPING_LABEL_UPDATED_BY_COL: 15, // Kolom O untuk updatedBy
  DB_SHIPPING_LABEL_CUSTOMER_ID_COL: 4, // Kolom D untuk customerId (relasi ke CUSTOMER)
  DB_SHIPPING_LABEL_URL_COL: 11, // Kolom K untuk URL label yang di-generate
  DB_SHIPPING_LABEL_PRINT_STATUS_COL: 12, // Kolom L untuk status cetak (Belum Cetak / Sudah Cetak)
  DB_SHIPPING_LABEL_SHIP_STATUS_COL: 13, // Kolom M untuk status pengiriman (Belum Kirim / Sudah Kirim) 

  DB_PRODUCT_LOOKUP_ID: '1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o',
  DB_PRODUCT_LOOKUP_SHEET_NAME: 'PM_PRODUCT',
  DB_PRODUCT_LOOKUP_TABLE_NAME: 'P_LOOKUP',
  DB_PRODUCT_LOOKUP_START_ROW: 2,
  DB_PRODUCT_LOOKUP_ID_COL: 1,
  DB_PRODUCT_LOOKUP_UPDATED_AT_COL: 11, // Kolom L untuk updatedAt
  DB_PRODUCT_LOOKUP_UPDATED_BY_COL: 12, // Kolom M untuk updatedBy
  DB_PRODUCT_LOOKUP_KODE_BARANG_OLD_COL: 2, // Kolom B untuk kodeBarang
  DB_PRODUCT_LOOKUP_KODE_BARANG_NEW_COL: 3, // Kolom B untuk kodeBarang
  DB_PRODUCT_LOOKUP_NAMA_BARANG_ERP_COL: 5, // Kolom D untuk namaBarang
  DB_PRODUCT_LOOKUP_NAMA_DAGANG_COL: 4, // Kolom E untuk kategori
  DB_PRODUCT_LOOKUP_TAHUN_COL: 8, // Kolom F untuk subKategori
  // Struktur: 1:ID | 2:KODE BARANG | 3:NAMA DAGANG | 4:NAMA BARANG (NEW) | 5:KATEGORI | 6:JENIS | 7:TAHUN | 8:HJPHET | 9:UPDATED AT | 10:UPDATED BY

  DB_BATCH_LOOKUP_ID: '1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o',
  DB_BATCH_LOOKUP_SHEET_NAME: 'PM_BATCH',
  DB_BATCH_LOOKUP_TABLE_NAME: 'LOOKUP',
  DB_BATCH_LOOKUP_START_ROW: 2, 
  DB_BATCH_LOOKUP_ID_COL: 1, 
  DB_BATCH_LOOKUP_PRODUCT_ID_COL: 2, // Kolom B untuk productId (relasi ke PM_PRODUCT)

  DB_BATCH_LOOKUP_BATCH_COL: 7, // Ganti dengan nomor kolom No Batch
  DB_BATCH_LOOKUP_EXPIRY_DATE_COL:9, // Ganti dengan nomor kolom Expiry Date
  DB_BATCH_LOOKUP_SYS_STATUS_COL: 12, // Ganti dengan nomor kolom sysStatus

  DB_BATCH_LOOKUP_CREATED_AT_COL: 22, // Kolom W untuk created at
  DB_BATCH_LOOKUP_UPDATED_AT_COL: 23, // Kolom X untuk updated at
  DB_BATCH_LOOKUP_UPDATED_BY_COL: 24, // Kolom Y untuk updated by
  DB_BATCH_LOOKUP_NOTES_BY_COL: 25, // Kolom Z untuk first system notes (hanya 1 kali)
  DB_BATCH_LOOKUP_FOTO_URL_BY_COL: 14, // Kolom O untuk dict foto url
  DB_BATCH_LOOKUP_INFO_URL_BY_COL: 15, // Kolom P untuk url website later
  DB_BATCH_LOOKUP_PER_BUCKET_BY_COL: 21, // Kolom V untuk per bucket (jumlah item per bucket)
  DB_BATCH_LOOKUP_DIMENSION_PLT_COL: 16,

  // Tambahkan ini di dalam AppConfig.js
  DB_BATCH_FOTO_SHEET_NAME: 'PM_BATCH_FOTO',
  DB_BATCH_FOTO_START_ROW: 2,
  DB_BATCH_FOTO_ID_COL: 1,      // idFoto
  DB_BATCH_FOTO_PARENT_ID_COL: 2, // batchId (Foreign Key ke PM_BATCH)
  DB_BATCH_FOTO_UPLOAD_COL: 3,    // fotoUpload (Kolom Image AppSheet)

    DB_DISTRIBUSI_CURRENT:{
        DB_DISTRIBUSI_CURRENT_ID: '1prn-EWVb4lX3gwr_0IVhujxjc9BCDkhxqqpqqu2jwo4',
        DB_DISTRIBUSI_CURRENT_SHEET_NAME: 'MASTER DISTRIBUSI',
        DB_DISTRIBUSI_CURRENT_TABLE_NAME: 'ALL_DIST',
        DB_DISTRIBUSI_CURRENT_YEAR : '2026',
        DB_DISTRIBUSI_CURRENT_START_ROW: 2,
        DB_DISTRIBUSI_CURRENT_ID_COL: 20,  // KOLOM T untuk idDistribusi
        DB_DISTRIBUSI_CURRENT_UPDATED_AT_COL: 21, // Kolom U untuk updatedAt 
        DB_DISTRIBUSI_CURRENT_UPDATED_BY_COL: 22, // Kolom V untuk updatedBy
        DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER:{
            'tanggal' : 1,
            'namaKonsumen' : 5,
            'kotaCabang': 6,
            'kodeBarang': 8,
            'batch': 11,
            'penerimaan': 16,
            'distribusi': 17,
            'keterangan': 18,
            'catatan':19
        }
    },
    DB_DISTRIBUSI_COLD:[
        {
        DB_DISTRIBUSI_ID: '1JywVff65IRXuKcobbLIvcaufTMHCDcWHU8zx16-Eu-s',
        DB_DISTRIBUSI_SHEET_NAME: 'ALL DIST',
        DB_DISTRIBUSI_TABLE_NAME: 'Table1',
        DB_DISTRIBUSI_YEAR : '2025',
        DB_DISTRIBUSI_START_ROW: 2,
        DB_DISTRIBUSI_ID_COL: 17,  // kolom Q untuk idDistribusi
        DB_DISTRIBUSI_UPDATED_AT_COL: 18, // Kolom R untuk updatedAt
        DB_DISTRIBUSI_UPDATED_BY_COL: 19, // Kolom S untuk updatedBy
        DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER:{
            'tanggal' : 1,
            'namaKonsumen' : 5,
            'kotaCabang': 6,
            'kodeBarang': 9,
            'batch': 11,
            'penerimaan': 14,
            'distribusi': 15,
            'keterangan': 16,
            'catatan':16
        }
    },
        {
        DB_DISTRIBUSI_ID: 'NOT_SET_YET',
        DB_DISTRIBUSI_SHEET_NAME: 'NOT_SET_YET',
        DB_DISTRIBUSI_TABLE_NAME: 'NOT_SET_YET',
        DB_DISTRIBUSI_YEAR : '2024',
        DB_DISTRIBUSI_START_ROW: 2,
        DB_DISTRIBUSI_ID_COL: 18,  // kolom Q untuk idDistribusi
        DB_DISTRIBUSI_UPDATED_AT_COL: 19, // Kolom R untuk updatedAt
        DB_DISTRIBUSI_UPDATED_BY_COL: 20, // Kolom S untuk updatedBy
        DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER:{
            'tanggal' : 1,
            'namaKonsumen' : 5,
            'kotaCabang': 6,
            'kodeBarang': 9,
            'batch': 11,
            'penerimaan': 14,
            'distribusi': 15,
            'keterangan': 16,
            'catatan':16
        }
    },
        {
        DB_DISTRIBUSI_ID: 'NOT_SET_YET',
        DB_DISTRIBUSI_SHEET_NAME: 'NOT_SET_YET',
        DB_DISTRIBUSI_TABLE_NAME: 'NOT_SET_YET',
        DB_DISTRIBUSI_YEAR : '2023',
        DB_DISTRIBUSI_START_ROW: 2,
        DB_DISTRIBUSI_ID_COL: 18,  // kolom Q untuk idDistribusi
        DB_DISTRIBUSI_UPDATED_AT_COL: 19, // Kolom R untuk updatedAt
        DB_DISTRIBUSI_UPDATED_BY_COL: 20, // Kolom S untuk updatedBy
        DB_DISTRIBUSI_CURRENT_COLUMN_MAPPER:{
            'tanggal' : 1,
            'namaKonsumen' : 5,
            'kotaCabang': 6,
            'kodeBarang': 9,
            'batch': 11,
            'penerimaan': 14,
            'distribusi': 15,
            'keterangan': 16,
            'catatan':17
        }
    },
    ],
};