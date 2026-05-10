// source/_module/config/AppConfig.js

const ApplicationConfig = {
  app: {
    name: "PBF Manage",
    version: "2.3.0",

    // move to new method: --- IGNORE ---
    // webAppUrl: "https://script.google.com/macros/s/AKfycbzlqoerdfGyCNPryzaxOvNZ0DutljadQOCM1EXzFr58e_OZwx4zimmzeLAoE3YYCNNS/exec",

    externalApi: {
      productDetail: "https://script.google.com/macros/s/AKfycbwCYFD39K22lj4Z9xvVLitmMCLY2h46LEOLK83h9Nam33LacmaHKhhqPBZ8QsELF388/exec"
    }
  },
  drive: {
    archieve: {
      folderName: "ARCHIEVE",
      folderId: "1EPn-bPuKmt5Pfx9fsjeXxpw9FafMyeTJ",
      folders:[{
        folderName: "Documents",
        folderId:"1s29sGDIiJrml_aQGfa9T1XBhJUINBzsW",
        access:"private"
      },
      {
        folderName: "ProductPhotos",
        folderId:"1SL7iw2SCWPgflOIrKwDL9TvHor60YVhK",
        access:"public"
      }]
    },
    logoFileId: "18xdVTIKD8A7zbwfrVzX03wTNGaZv8KBF",
    archieveFolderId: "1wHjMQYXS12VA7WyMfhqFlz06Aj6asbWh",
    batchRecordFolderId: "1tXAjYIVX7qldupfvXnZh4zpZRvHL3c9m"
  },
  dataSources: {
    // move to new method: --- IGNORE ---
    // olap: {
    //   spreadsheetId: "1gj7a7zxc63cHYn5euAGFEioR07LRnxeqAicFPs5XqpQ",
    //   sheetName: "OLAP_AGG",
    //   startRow: 1
    // },
    // stockRekap: { sheetName: "PM_STOK_REKAP" },
    // stockColdRekap: { sheetName: "PM_STOK_COLD_REKAP" },

    //move to new method: --- IGNORE ---
    // user: {
    //   spreadsheetId: "1YV6SEg5Kd7rNHhoJquEqInZ6-DrTDKYwJZ4RGhBHJ0o",
    //   sheetName: "USER_SETTINGS",
    //   startRow: 2
    // },

    // customer: {
    //   spreadsheetId: "1_f130ciiAMSsE7E2GO2dQqdU__HDrfhN9o5rAqlfxTU",
    //   sheetName: "CUSTOMER",
    //   startRow: 2
    // },

    // product: {
    //   spreadsheetId: "1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o",
    //   sheetName: "PMS_PRODUCT",
    //   startRow: 2
    // },

    // batch: {
    //   spreadsheetId: "1hbmlZYMlCaeUvUVPe7sdj41PBK1oiGX75oF4-jCF71o",
    //   sheetName: "PMS_BATCH",
    //   startRow: 2,
    //   attachSheetName: "PMS_ATTACH"
    // },
    
    // MOVE TO NEW METHOD: --- IGNORE ---
    // shippingEmbalage: {
    //   spreadsheetId: "1Bt-LGX1F1ZjRmWG0u_Bm0nUtcylDR4xBVLN_GxmuEG8",
    //   lookupSheetName: "SHIPEMB_LOOKUP",
    //   startRow: 2
    // },

    shippingLabel: {
      spreadsheetId: "1OTF96eCC_J2hduJ8EEkhLK7LOyE_4CG2ZBu-7l3xpqo",
      sheetName: "SHIPLBL_MASTER",
      startRow: 2
    },

    analytics:{}, // approaching later

    master:{
      customer:{
        spreadsheetId:"1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM",
        spreadsheetName:"DATA MASTER",
        configs:[
          {
            type: "CUSTOMER",
            sheetName: "PMS_CUSTOMER",
            headerRow:5,
            startRow: 6,
            globalLastSyncAtCell:"B1",
            globalUpdatedAtCell: "B2",
            globalUpdatedByCell: "B3",
            fieldMapping: 
            {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              typeKonsumen: "TYPE KONSUMEN",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              namaSingkat:"NAMA SINGKAT",
              slug: "SLUG",
              provinsi: "PROVINSI",
              kota : "KOTA",
              alamat: "ALAMAT",
              pic: "PIC",
              kontak: "KONTAK",
              maps: "MAPS",
              jarak: "JARAK (KM)",
              kategori: "KATEGORI",
            }

          },

      ]
      },
      product:{
        spreadsheetId:"1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM",
        spreadsheetName:"DATA MASTER",
        configs:[
        {
          type: "PRODUCT",
          sheetName: "PMS_PRODUCT",
          headerRow:5,
          startRow: 6,
          globalLastSyncAtCell:"B1",
          globalUpdatedAtCell: "B2",
          globalUpdatedByCell: "B3",
          fieldMapping: 
          {
            id: "ID",
            createdAt: "CREATED AT",
            updatedAt: "UPDATED AT",
            updatedBy: "UPDATED BY",
            statues: "STATUES",
            year: "TAHUN",
            kodeBarang: "KODE BARANG",
            kodeBarangNew: "KODE BARANG (NEW)",
            namaBarang: "NAMA BARANG",
            namaBarangNew: "NAMA BARANG (NEW)",
            kategori: "KATEGORI",
            jenis: "JENIS",
            satuan: "SATUAN",
            suhu: "SUHU",
            Hjp: "HJP",
            Het: "HET",
          },
        },
        {
          type: "BATCH",
          sheetName: "PMS_BATCH",
          headerRow:5,
          startRow: 6,
          globalLastSyncAtCell:"B1",
          globalUpdatedAtCell: "B2",
          globalUpdatedByCell: "B3",
          fieldMapping: 
          {
            id: "ID",
            createdAt: "CREATED AT",
            updatedAt: "UPDATED AT",
            updatedBy: "UPDATED BY",
            statues: "STATUES",
            SysStatus: "SYS STATUS",
            productId: "PRODUCT ID",
            alokasi: "ALOKASI",
            sektor:"SEKTOR",
            kodeBarang: "KODE BARANG",
            namaBarang: "NAMA BARANG",
            batch: "BATCH",
            mfgDate: "MFG DATE",
            expireDate: "EXPIRE DATE",
            status: "STATUS",
            rslBulan: "RSL (BULAN)",
            rslHari: "RSL (HARI)",
            nomorIzinEdar: "NIE",
            dimensi: "DIMENSI",
            berat: "BERAT",
            perBucket: "PER BUCKET",
            vvmStatus: "VVM STATUS",
            notes: "NOTES",
            catatanFisik: "CATATAN FISIK",
            webUrl: "webUrl",
            recordUrl: "recordUrl",
          },
        },
      ],
      },
      shippingEmbalage:{
        spreadsheetId:"1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM",
        spreadsheetName:"DATA MASTER",
        configs:[
          {
            type: "SEMB",
            sheetName: "PMS_SEMB",
            headerRow:5,
            startRow: 6,
            globalLastSyncAtCell:"B1",
            globalUpdatedAtCell: "B2",
            globalUpdatedByCell: "B3",
            fieldMapping: 
            {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              aliasErp: "ALIAS ERP",
              kategori: "KATEGORI",
              satuan: "SATUAN",
              keterangan: "KETERANGAN",
              safetyStock: "SAFETY STOCK",
              reorderPoint: "REORDER POINT",
            }
          },
        ]
      },
      productEmbalage:{
        spreadsheetId:"1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM",
        spreadsheetName:"DATA MASTER",
        configs:[
          {
            type: "PEMB",
            sheetName: "PMS_PEMB",
            headerRow:5,
            startRow: 6,
            globalLastSyncAtCell:"B1",
            globalUpdatedAtCell: "B2",
            globalUpdatedByCell: "B3",
            fieldMapping: 
            {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              aliasErp: "ALIAS ERP",
              batch: "BATCH",
              expireDate: "EXPIRE DATE",
              kategori: "KATEGORI",
              satuan: "SATUAN",
              keterangan: "KETERANGAN",
              safetyStock: "SAFETY STOCK",
              reorderPoint: "REORDER POINT",
            }
          },
        ]
      },
      user:{
        spreadsheetId: '1YV6SEg5Kd7rNHhoJquEqInZ6-DrTDKYwJZ4RGhBHJ0o',
        spreadsheetName:'ENVIRONTMENT',
        configs:[
          {
            type: "USER",
            sheetName: "_USER",
            headerRow: 5,
            startRow:6,
            globalLastSyncAtCell:"B1",
            globalUpdatedAtCell: "B2",
            globalUpdatedByCell: "B3", 
            fieldMapping:           
            {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              email: "EMAIL",
              passwordHash: "PASSWORD HASH",
              salt: "SALT",
              role: "ROLE",
              namaLengkap:"NAMA LENGKAP"
            }
          }
        ]
      },
    },

    driveArchieve: {
      spreadsheetId: "13l_jPfddoJFaklJpFwDRfsupdAmZjslbh1Y3LQvaXNw",
      sheetName: "ALL_ARCHIEVE",
      headerRow:5,
      startRow: 6,
      //not yet implemented, need approach ->
      globalLastSyncAtCell:"B1",
      globalUpdatedAtCell: "B2",
      globalUpdatedByCell: "B3",   
      // -<
      configs: [{
        type: "ARCHIEVE",
        fieldMapping: {
          id: "ID",
          createdAt: "CREATED AT",
          updatedAt: "UPDATED AT",
          updatedBy: "UPDATED BY",
          statues: "STATUES",
          entityId: "ENTITY ID",
          entityType: "ENTITY TYPE",
          entityName: "ENTITY NAME",
          documentType: "DOCUMENT TYPE",
          fileName: "FILE NAME",
          fileSize: "FILE SIZE",
          mimeType: "MIME TYPE",
          driveFileId: "DRIVE FILE ID",
          driveFolderId: "DRIVE FOLDER ID",
          url: "URL",
          thumbhnailUrl: "THUMBNAIL URL",
          documentDate: "DOCUMENT DATE",
          expireDate: "EXPIRE DATE",
          remarks: "REMARKS",
          tags: "TAGS",
          isPublic: "IS PUBLIC",
          notes: "NOTES",
      },
      }]
    },

    transactional: [
      {
        year: "2025",
        spreadsheetId: "1JywVff65IRXuKcobbLIvcaufTMHCDcWHU8zx16-Eu-s",
        configs: [
          {
            type: "ALL_DIST",
            sheetName: "ALL_DIST",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "H1",
            globalLastSyncAtCell: "H2",
            globalUpdatedByCell: "H3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noSO_MOV: "NO SO/MOV",
              noPS_DOK: "NO PS/DOK",
              costCenter: "COST CENTER",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              alokasi: "ALOKASI",
              sektor: "SEKTOR",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              expireDate: "EXPIRE DATE",
              status: "STATUS",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              keterangan: "KETERANGAN"
            }
          },
          {
            type: "ALL_RCV",
            sheetName: "ALL_RCV",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "J1",
            globalLastSyncAtCell: "J2",
            globalUpdatedByCell: "J3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              productId: "PRODUCT ID",
              batchId: "BATCH ID",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              jam: "JAM",
              noDokumen: "NO DOKUMEN",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              mfgDate: "MFG DATE",
              expireDate: "EXPIRE DATE",
              kondisiKemasan: "KONDISI KEMASAN",
              nomorIzinEdar: "NOMOR IZIN EDAR",
              jenisKemasan: "JENIS KEMASAN",
              jumlahFisik: "JUMLAH FISIK",
              jumlahPerBucket: "JUMLAH PER BUCKET",
              jumlahBucket: "JUMLAH BUCKET",
              catatanFisik: "CATATAN FISIK",
              placement: "PLACEMENT"
            }
          },
          {
            type: "ALL_CONS",
            sheetName: "ALL_CONS",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "G1",
            globalLastSyncAtCell: "G2",
            globalUpdatedByCell: "G3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDokumen: "NO DOKUMEN",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              keterangan: "KETERANGAN"
            }
          },
          {
            type: "ALL_SEMB",
            sheetName: "ALL_SEMB",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "I1",
            globalLastSyncAtCell: "I2",
            globalUpdatedByCell: "I3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              idSemb: "ID SEMB",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDok: "NO DOK",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              kategori: "KATEGORI",
              satuan: "SATUAN",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              catatan: "CATATAN"
            }
          },
          {
            type: "ALL_PEMB",
            sheetName: "ALL_PEMB",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "I1",
            globalLastSyncAtCell: "I2",
            globalUpdatedByCell: "I3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              idPemb: "ID PEMB",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDok: "NO DOK",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              alokasi: "ALOKASI",
              sektor: "SEKTOR",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              expireDate: "EXPIRE DATE",
              kategori: "KATEGORI",
              satuan: "SATUAN",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              catatan: "CATATAN"
            }
          }
        ]
      },
      {
        year: "2026",
        // spreadsheetId: "1prn-EWVb4lX3gwr_0IVhujxjc9BCDkhxqqpqqu2jwo4",
        spreadsheetId: "1We8-S0lVx68vXU2M2cgnmkeK4WbUNPENGSLrPhS6f-w",
        configs: [
          {
            type: "ALL_DIST",
            sheetName: "ALL_DIST",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "H1",
            globalLastSyncAtCell: "H2",
            globalUpdatedByCell: "H3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDok: "NO DOK",
              noPO: "NO PO",
              noSO_MOV: "NO SO/MOV",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              kategori: "KATEGORI",
              alokasi: "ALOKASI",
              sektor: "SEKTOR",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              namaDagang: "NAMA DAGANG",
              batch: "BATCH",
              mfgDate: "MFG DATE",
              expireDate: "EXPIRE DATE",
              status: "STATUS",
              rslBulan: "RSL(BULAN)",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              keterangan: "KETERANGAN",
              catatan: "CATATAN"
            }
          },
          {
            type: "ALL_RCV",
            sheetName: "ALL_RCV",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "J1",
            globalLastSyncAtCell: "J2",
            globalUpdatedByCell: "J3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              productId: "PRODUCT ID",
              batchId: "BATCH ID",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              jam: "JAM",
              noDokumen: "NO DOKUMEN",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              mfgDate: "MFG DATE",
              expireDate: "EXPIRE DATE",
              kondisiKemasan: "KONDISI KEMASAN",
              nomorIzinEdar: "NOMOR IZIN EDAR",
              jenisKemasan: "JENIS KEMASAN",
              jumlahFisik: "JUMLAH FISIK",
              jumlahPerBucket: "JUMLAH PER BUCKET",
              jumlahBucket: "JUMLAH BUCKET",
              catatanFisik: "CATATAN FISIK",
              placement: "PLACEMENT"
            }
          },
          {
            type: "ALL_CONS",
            sheetName: "ALL_CONS",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "G1",
            globalLastSyncAtCell: "G2",
            globalUpdatedByCell: "G3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDokumen: "NO DOKUMEN",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              keterangan: "KETERANGAN"
            }
          },
          {
            type: "ALL_SEMB",
            sheetName: "ALL_SEMB",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "I1",
            globalLastSyncAtCell: "I2",
            globalUpdatedByCell: "I3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              idSemb: "ID SEMB",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDok: "NO DOK",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              kategori: "KATEGORI",
              satuan: "SATUAN",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              catatan: "CATATAN"
            }
          },
          {
            type: "ALL_PEMB",
            sheetName: "ALL_PEMB",
            startRow: 6,
            headerRow:5,
            globalUpdatedAtCell: "I1",
            globalLastSyncAtCell: "I2",
            globalUpdatedByCell: "I3",
            fieldMapping: {
              id: "ID",
              createdAt: "CREATED AT",
              updatedAt: "UPDATED AT",
              updatedBy: "UPDATED BY",
              idPemb: "ID PEMB",
              statues: "STATUES",
              type: "TYPE",
              tanggal: "TANGGAL",
              noDok: "NO DOK",
              namaKonsumen: "NAMA KONSUMEN",
              kotaCabang: "KOTA/CABANG",
              alokasi: "ALOKASI",
              sektor: "SEKTOR",
              kodeBarang: "KODE BARANG",
              namaBarang: "NAMA BARANG",
              batch: "BATCH",
              expireDate: "EXPIRE DATE",              
              kategori: "KATEGORI",
              satuan: "SATUAN",
              penerimaan: "PENERIMAAN",
              distribusi: "DISTRIBUSI",
              catatan: "CATATAN"
            }
          }
        ]
      }
    ],

    // move to new method: --- IGNORE ---
    // logging: {
    //   spreadsheetId: "19ynIDMTX67ReGEjFHNCImuiVxY_oldB9L7DcmBDpE64",
    //   sheetName: "CHANGE_LOG",
    //   startRow: 2
    // }


  },
  settings: {
    defaultLimit: 500,
    maxFetchRows: 5000,
    cacheTTLSeconds: 600,
    logoThumbnailSize: "w200",
    photoThumbnailSize: "w300"
  }
};