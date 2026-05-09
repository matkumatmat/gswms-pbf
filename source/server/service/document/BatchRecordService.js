// source/server/service/document/BatchRecordService.js

/**
 * Service untuk menghasilkan Batch Record dalam berbagai format (XLSX, JSON, dll).
 * Styling & struktur setiap format ditentukan di sini, bukan di wrapper.
 */
function BatchRecordService(repository, batchMasterFactory, archieveFactory) {
  this.repo = repository;
  this.batchService = batchMasterFactory.getService();
  this.archieveService = archieveFactory.getService();

  // ────────────── PRIVATE: Data Enrichment ──────────────
  function _getEnrichedData(batchNo) {
    const data = this.repo.getEnrichedHistory(batchNo);
    if (!data || !data.length) throw new Error('Tidak ada riwayat untuk batch ' + batchNo);

    let batchMeta;
    try {
      // coba ambil metadata dari master batch yang paling baru (dengan fuzzy search)
      const allBatches = this.batchService.getAll();
      const found = allBatches.find(b => String(b.batch || '').trim().toUpperCase() === batchNo.trim().toUpperCase());
      if (found) batchMeta = found;
    } catch(e) {
      // lanjut
    }
    if (!batchMeta) {
      // fallback dari data pertama
      batchMeta = {
        kodeBarang: data[0].kodeBarang || '-',
        namaBarang: data[0].namaBarang || '-',
        batch: batchNo,
        nie: data[0].nie || '-',
        mfgDate: data[0].mfgDate || '',
        expireDate: data[0].expireDate || ''
      };
    }
    return { data, batchMeta };
  }

  // ────────────── BUILDER: XLSX ─────────────────────────
  function _buildXlsxBlob(data, meta) {
    const aoa = [];

    // Meta identitas produk
    aoa.push(['KODE BARANG', ':', meta.kodeBarang || '', '', 'MFG DATE', ':', meta.mfgDate || '']);
    aoa.push(['NAMA BARANG', ':', meta.namaBarang || '', '', 'EXPIRE DATE', ':', meta.expireDate || '']);
    aoa.push(['BATCH', ':', meta.batch || '', '', 'SUHU', ':', meta.suhu || '-']);
    aoa.push(['NIE', ':', meta.nie || '-', '', '', '', '']);
    aoa.push([], []); // spacer

    // Header tabel
    aoa.push(['TANGGAL', 'NAMA KONSUMEN', 'KOTA/CABANG', 'PENERIMAAN', 'DISTRIBUSI', 'SALDO']);

    // Data mutasi
    data.forEach(row => {
      aoa.push([
        row.tanggal ? DateUtils.formatDDMMYYYY(row.tanggal) : '-',
        row.namaKonsumen || '-',
        row.kotaCabang || '-',
        row.penerimaan === 0 ? '-' : row.penerimaan,
        row.distribusi === 0 ? '-' : row.distribusi,
        row.saldo ?? 0
      ]);
    });

    // ── Styling Config ──────────────────────────────────────
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFFF00' } },
      border: { top:{ style:'thin' }, bottom:{ style:'thin' }, left:{ style:'thin' }, right:{ style:'thin' } }
    };
    const dataBorder = {
      border: { top:{ style:'thin' }, bottom:{ style:'thin' }, left:{ style:'thin' }, right:{ style:'thin' } }
    };
    const boldMetaField = { font: { bold: true } };

    const cellStyles = [];
    // Bold pada kolom label meta (indeks 0 dan 4 untuk baris 0-3)
    [0,1,2,3].forEach(r => {
      cellStyles.push({ r, c:0, style: boldMetaField });
      if (r !== 3) cellStyles.push({ r, c:4, style: boldMetaField });
    });

    // Logo dari AppConfig
    let logoCfg = null;
    const logoFileId = ApplicationConfig.drive.logoFileId;
    if (logoFileId) {
      try {
        const blob = DriveApp.getFileById(logoFileId).getBlob();
        const base64 = Utilities.base64Encode(blob.getBytes());
        logoCfg = {
          image: 'data:' + blob.getContentType() + ';base64,' + base64,
          from: { col: 3, row: 0 },
          to:   { col: 5, row: 2 }
        };
      } catch(e) {
        Logger.log('gagal mengambil logo'+ e.message);
      }
    }

    const config = {
      sheetName: 'Mutasi Fisik',
      columnWidths: [{wch:12},{wch:30},{wch:20},{wch:15},{wch:15},{wch:15}],
      data: aoa,
      headerStyle: headerStyle,          // header tabel di baris 6 (indeks 6)
      dataStyle: dataBorder,             // border untuk semua data
      cellStyles: cellStyles,
      pageSetup: { fitToWidth: 1, orientation: 'landscape' },
      logo: logoCfg
    };

    // Header style hanya untuk header tabel, bukan meta atas. Kita perlu menimpanya dengan cellStyles.
    // @note: headerStyle akan diaplikasikan ke baris 0 AoA (bukan yang kita maksud).
    // Oleh karena itu, kita kontrol langsung via cellStyles untuk header tabel.
    // Agar tepat, kita kosongkan headerStyle di config dan set via cellStyles untuk header tabel yang sebenarnya.
    // Perbaiki:

    config.headerStyle = null; // nonaktifkan styling otomatis
    const headerRowIdx = 6; // indeks di aoa
    for (let c = 0; c < 6; c++) {
      cellStyles.push({ r: headerRowIdx, c, style: headerStyle });
    }

    const fileName = 'BatchRecord_' + (meta.batch || batchNo) + '_' + Date.now();
    return XlsxWrapper.generateXlsx(config, fileName);
  }

  // ────────────── PUBLIC EXPORT ──────────────────────────
  this.export = function(batchNo, format, options) {
    const { data, batchMeta } = _getEnrichedData.call(this, batchNo);
    let blob, mimeType, fileName;

    switch (format) {
      case 'xlsx':
        blob = _buildXlsxBlob(data, batchMeta);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = 'BatchRecord_' + batchNo + '.xlsx';
        break;

      case 'json':
        blob = Utilities.newBlob(
          JSON.stringify({
            metadata: batchMeta,
            transactions: data
          }),
          'application/json',
          'BatchRecord_' + batchNo + '.json'
        );
        mimeType = 'application/json';
        fileName = 'BatchRecord_' + batchNo + '.json';
        break;

      default:
        throw new Error('Format tidak didukung: ' + format);
    }

    // Simpan ke Archieve (Drive) dan catat metadata
    const uploaded = this.archieveService.uploadFile({
      fileName: fileName,
      mimeType: mimeType,
      base64Data: Utilities.base64Encode(blob.getBytes()),
      entityId: batchMeta.batch || batchNo,
      entityType: 'BATCH',
      entityName: batchMeta.namaBarang || '',
      documentType: 'BATCH_RECORD',
      isPublic: false
    });

    return {
      id: uploaded.id,
      url: uploaded.url,
      fileName: uploaded.fileName,
      format: format,
      blob: blob
    };
  };

  /**
   * Menghasilkan Blob sesuai format, TANPA menyimpan ke Drive.
   */
  this.generateBlob = function(batchNo, format) {
    const { data, batchMeta } = _getEnrichedData.call(this, batchNo);

    switch (format) {
      case 'xlsx':
        return _buildXlsxBlob(data, batchMeta);
      case 'json':
        return Utilities.newBlob(
          JSON.stringify({ metadata: batchMeta, transactions: data }),
          'application/json',
          'BatchRecord_' + batchNo + '.json'
        );
      default:
        throw new Error('Format tidak didukung: ' + format);
    }
  };

  /**
   * Menghasilkan Blob dan menyimpannya ke Drive/Archieve.
   * Hanya bisa dipanggil oleh user yang memiliki akses Drive (misalnya dari server/trigger).
   */
  this.generateAndArchive = function(batchNo, format) {
    const blob = this.generateBlob(batchNo, format);
    const { batchMeta } = _getEnrichedData.call(this, batchNo);

    const mimeType = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/json';

    const fileName = 'BatchRecord_' + batchNo + '.' + (format === 'xlsx' ? 'xlsx' : 'json');

    const uploaded = this.archieveService.uploadFile({
      fileName: fileName,
      mimeType: mimeType,
      base64Data: Utilities.base64Encode(blob.getBytes()),
      entityId: batchMeta.batch || batchNo,
      entityType: 'BATCH',
      entityName: batchMeta.namaBarang || '',
      documentType: 'BATCH_RECORD',
      isPublic: false
    });

    return {
      id: uploaded.id,
      url: uploaded.url,
      fileName: uploaded.fileName,
      format: format,
      blob: blob
    };
  };
}  
