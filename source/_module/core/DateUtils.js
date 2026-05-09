// source/_module/core/DateUtils.js
const DateUtils = (function() {
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Format tanggal ke "DD MMM YY" (contoh: 14 Apr 25)
   */
  function formatShortDate(dateInput) {
    if (!dateInput) return '-';
    let d = new Date(dateInput);
    if (!isValidDate(d)) return String(dateInput);
    const day = d.getDate();
    const month = MONTHS_SHORT[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  }

  /**
   * Format tanggal ke "DD/MM/YYYY" (standar Eropa)
   */
  function formatDDMMYYYY(dateInput) {
    let d = new Date(dateInput);
    if (!isValidDate(d)) return '-';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /**
   * Format tanggal ke "YYYY-MM-DD" (ISO lokal)
   */
  function formatYYYYMMDD(dateInput) {
    let d = new Date(dateInput);
    if (!isValidDate(d)) return '-';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Hitung sisa hari dan bulan dari expiry date terhadap reference date (default hari ini)
   * @returns { days: number|null, months: number|null }
   */
  function calculateRemainingShelfLife(expiryDate, referenceDate = new Date()) {
    let exp = new Date(expiryDate);
    if (!isValidDate(exp)) return { days: null, months: null };
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp - ref;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = days > 0 ? parseFloat((days / 30.44).toFixed(1)) : (days < 0 ? 0 : parseFloat((days / 30.44).toFixed(1)));
    return { days: days, months: months };
  }

  /**
   * Cek apakah expiry date sudah lewat dari reference date
   */
  function isExpired(expiryDate, referenceDate = new Date()) {
    const exp = new Date(expiryDate);
    if (!isValidDate(exp)) return false;
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);
    return exp < ref;
  }

  /**
   * Selisih hari antara dua tanggal (tanggal2 - tanggal1)
   */
  function diffDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (!isValidDate(d1) || !isValidDate(d2)) return NaN;
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  return {
    formatShortDate: formatShortDate,
    formatDDMMYYYY: formatDDMMYYYY,
    formatYYYYMMDD: formatYYYYMMDD,
    calculateRemainingShelfLife: calculateRemainingShelfLife,
    isExpired: isExpired,
    diffDays: diffDays,
    
    // helper to access months if needed
    MONTHS_SHORT: MONTHS_SHORT,
    MONTHS_LONG: MONTHS_LONG
  };
})();