// source/_module/core/StringUtils.js
const StringUtils = (function() {
  /**
   * Memotong string hingga panjang maksimum, menambahkan '...' jika terpotong
   */
  function truncate(str, maxLength = 50, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Menghapus spasi berlebih dan mengubah ke lowercase, cocok untuk slug
   */
  function slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Sanitasi sederhana untuk mencegah XSS (mengganti < dan >)
   */
  function sanitizeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  /**
   * Huruf pertama setiap kata kapital
   */
  function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Hapus semua spasi, karakter khusus, untuk pencarian loose
   */
  function normalizeSearch(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  return {
    truncate: truncate,
    slugify: slugify,
    sanitizeHtml: sanitizeHtml,
    capitalizeWords: capitalizeWords,
    normalizeSearch: normalizeSearch
  };
})();