// source/_module/core/ValidationUtils.js
const ValidationUtils = (function() {
  /**
   * Cek apakah value tidak kosong (null, undefined, string kosong, array kosong)
   */
  function isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Validasi format email sederhana
   */
  function isEmail(value) {
    if (!value) return false;
    const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return re.test(String(value).trim());
  }

  /**
   * Validasi format nomor telepon Indonesia (minimal 10 digit, maksimal 15 digit, boleh +62)
   */
  function isPhoneNumber(value) {
    if (!value) return false;
    const cleaned = String(value).replace(/[\s\-\(\)\+]/g, '');
    // izinkan +62 atau 0 diikuti 9-14 digit
    const re = /^(?:0|62)(?:\d{9,14})$/;
    return re.test(cleaned);
  }

  /**
   * Cek apakah nilai adalah angka (termasuk string angka)
   */
  function isNumeric(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return !isNaN(value);
    const trimmed = String(value).trim();
    if (trimmed === '') return false;
    const num = NumberUtils.parseIndonesianNumber(trimmed);
    return !isNaN(num);
  }

  /**
   * Validasi tanggal (string atau Date object)
   */
  function isValidDate(value) {
    if (!value) return false;
    const d = new Date(value);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Cek apakah angka berada dalam rentang min - max (inklusif)
   */
  function isInRange(value, min, max) {
    const num = NumberUtils.toNumber(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  }

  /**
   * Validasi panjang string (min, max)
   */
  function isLength(value, min = 0, max = Infinity) {
    const str = value ? String(value) : '';
    const len = str.length;
    return len >= min && len <= max;
  }

  /**
   * Cek apakah value adalah salah satu dari array yang diizinkan (generic helper)
   * @param {any} value 
   * @param {Array} allowedValues 
   * @returns {boolean}
   */
  function isOneOf(value, allowedValues) {
    if (!Array.isArray(allowedValues)) return false;
    return allowedValues.some(allowed => allowed === value);
  }

  /**
   * Validasi URL (http/https)
   */
  function isUrl(value) {
    if (!value) return false;
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(value);
  }

  return {
    isRequired: isRequired,
    isEmail: isEmail,
    isPhoneNumber: isPhoneNumber,
    isNumeric: isNumeric,
    isValidDate: isValidDate,
    isInRange: isInRange,
    isLength: isLength,
    isOneOf: isOneOf,
    isUrl: isUrl
  };
})();