// source/_module/workspace/xlsxwrapper/XlsxWrapper.js
const XlsxWrapper = (function() {
  const CDN_URL = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
  let XLSX = null;

  function loadLibrary() {
    if (XLSX) return XLSX;
    const libContent = UrlFetchApp.fetch(CDN_URL).getContentText();
    eval(libContent);
    XLSX = typeof XLSX !== 'undefined' ? XLSX : null;
    if (!XLSX) throw new Error('xlsx-js-style library failed to load');
    return XLSX;
  }

  /**
   * Generate XLSX Blob dari konfigurasi yang diberikan.
   * @param {Object} config
   * @param {string} config.sheetName
   * @param {Array<{wch:number}>} [config.columnWidths]
   * @param {Array<Array>} config.data          - Header di baris pertama, data di baris berikutnya
   * @param {Object} [config.headerStyle]       - Style untuk baris pertama (header)
   * @param {Object} [config.dataStyle]         - Style untuk seluruh baris data (mulai baris 1)
   * @param {Array<{r:number,c:number,style:Object}>} [config.cellStyles] - Custom styling untuk sel tertentu
   * @param {{fitToWidth:number,orientation:string}} [config.pageSetup]
   * @param {{image:string,from:{col:number,row:number},to:{col:number,row:number}}} [config.logo]
   * @param {string} fileName
   * @returns {Blob}
   */
  function generateXlsx(config, fileName) {
    const lib = loadLibrary();
    const ws = lib.utils.aoa_to_sheet(config.data);
    const wb = lib.utils.book_new();
    lib.utils.book_append_sheet(wb, ws, config.sheetName);

    // column widths
    if (config.columnWidths) ws['!cols'] = config.columnWidths;

    // header style (baris 0)
    if (config.headerStyle) {
      const headerRowIdx = 0;
      for (let c = 0; c < config.data[headerRowIdx]?.length || 0; c++) {
        const cellRef = lib.utils.encode_cell({ r: headerRowIdx, c });
        if (ws[cellRef]) ws[cellRef].s = config.headerStyle;
      }
    }

    // data style (start row 1)
    if (config.dataStyle) {
      for (let r = 1; r < config.data.length; r++) {
        for (let c = 0; c < config.data[r].length; c++) {
          const cellRef = lib.utils.encode_cell({ r, c });
          if (ws[cellRef]) ws[cellRef].s = Object.assign({}, ws[cellRef].s || {}, config.dataStyle);
        }
      }
    }

    // custom cell styles
    if (config.cellStyles) {
      config.cellStyles.forEach(cs => {
        const cellRef = lib.utils.encode_cell({ r: cs.r, c: cs.c });
        if (ws[cellRef]) ws[cellRef].s = cs.style;
      });
    }

    // page setup
    if (config.pageSetup) ws['!pageSetup'] = config.pageSetup;

    // logo
    if (config.logo) {
      ws['!images'] = [{
        image: config.logo.image,
        type: config.logo.image.split(';')[0].split('/')[1] || 'png',
        position: {
          from: { col: config.logo.from.col, row: config.logo.from.row },
          to:   { col: config.logo.to.col,   row: config.logo.to.row }
        }
      }];
    }

    const base64 = lib.write(wb, { bookType: 'xlsx', type: 'base64' });
    const bytes = Utilities.base64Decode(base64);
    return Utilities.newBlob(
      bytes,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName + '.xlsx'
    );
  }

  return { generateXlsx };
})();