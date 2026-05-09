// source/_module/core/FileUtils.js

/**
 * File and MIME utilities (IIFE, global).
 * Reusable helpers for archive operations.
 */
const FileUtils = (function() {
  /**
   * Parse base64 string – strips data URI prefix if present.
   * @param {string} input - Raw base64 or data: URI
   * @returns {{ mimeType: string|null, base64: string }}
   */
  function parseBase64(input) {
    if (!input) return { mimeType: null, base64: '' };
    const match = input.match(/^data:([^;]+);base64,(.+)$/i);
    if (match) {
      return { mimeType: match[1].toLowerCase(), base64: match[2] };
    }
    return { mimeType: null, base64: input };
  }

  /**
   * Convert bytes to human-friendly string (KB, MB…).
   * @param {number} bytes
   * @returns {string}
   */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from MIME type.
   * @param {string} mimeType
   * @returns {string}
   */
  function getExtensionFromMimeType(mimeType) {
    switch (mimeType) {
      case 'application/pdf': return 'pdf';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return 'xlsx';
      case 'application/vnd.ms-excel': return 'xls';
      case 'application/msword': return 'doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'docx';
      case 'text/csv': return 'csv';
      case 'application/json': return 'json';
      case 'image/png': return 'png';
      case 'image/jpeg': return 'jpg';
      case 'image/webp': return 'webp';
      case 'image/gif': return 'gif';
      default: return mimeType.split('/').pop() || 'bin';
    }
  }

  /**
   * Determine if a MIME type is an image.
   * @param {string} mimeType
   * @returns {boolean}
   */
  function isImage(mimeType) {
    return typeof mimeType === 'string' && mimeType.startsWith('image/');
  }

  function isValidBase64(str) {
  if (!str) return false;
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
  }

  return {
    isValidBase64,
    parseBase64,
    formatBytes,
    getExtensionFromMimeType,
    isImage
  };
})();