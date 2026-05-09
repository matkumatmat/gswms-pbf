// source/_module/core/NumberUtils.js
const NumberUtils = (function() {
  /**
   * Mengubah string angka Indonesia (1.234,56) menjadi number JavaScript
   * Contoh: "1.234,56" -> 1234.56
   */
  function parseIndonesianNumber(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Format number dengan pemisah ribuan titik dan desimal koma
   */
  function formatIndonesianNumber(num, decimals = 0) {
    if (num === null || isNaN(num)) return '0';
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(decimals > 0 ? ',' : '');
  }

  /**
   * Memastikan nilai adalah number (default 0 jika invalid)
   */
  function toNumber(val, defaultValue = 0) {
    const num = parseIndonesianNumber(val);
    return isNaN(num) ? defaultValue : num;
  }

  return {
    parseIndonesianNumber: parseIndonesianNumber,
    formatIndonesianNumber: formatIndonesianNumber,
    toNumber: toNumber
  };
})();