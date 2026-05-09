// source/_module/core/AppUtils.js
const AppUtils = (function() {
  /**
   * Generate UUID (menggunakan Utilities jika ada, fallback ke random client-side)
   */
  function generateUUID() {
    if (typeof Utilities !== 'undefined' && Utilities.getUuid) {
      return Utilities.getUuid();
    }
    // client-side simple uuid v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Safe JSON parse (hanya jika string diawali { atau [ dan diakhiri } atau ])
   */
  function safeParseJson(value) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return value;
      }
    }
    return value;
  }

  /**
   * Mengubah array of arrays menjadi array of objects dengan keys yang diberikan.
   * @param {Array<Array>} rows - Data mentah
   * @param {Array<string>} keys - Nama-nama properti
   * @returns {Array<Object>}
   */
  function mapArrayToObject(rows, keys) {
    if (!Array.isArray(rows) || !Array.isArray(keys)) return [];
    return rows.map(row => {
      let obj = {};
      keys.forEach((key, idx) => {
        let val = row[idx];
        if (typeof val === 'string') val = val.trim();
        obj[key] = (val !== undefined && val !== '') ? val : null;
      });
      return obj;
    });
  }

  /**
   * Deep clone object (simple, cukup untuk data kecil)
   */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Delay promise (untuk simulasi async)
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

  return {
    generateUUID: generateUUID,
    safeParseJson: safeParseJson,
    mapArrayToObject: mapArrayToObject,
    deepClone: deepClone,
    delay: delay
  };
})();


// getAuditTrail: function(explicitUserEmail) {
//   var email = explicitUserEmail || 'System';
//   if (email === 'System') {
//     try {
//       var user = Session.getActiveUser();
//       if (user && user.getEmail()) email = user.getEmail();
//     } catch(e) {}
//   }
//   return { updatedAt: new Date(), updatedBy: email };
// },

// invalidateCache: function(cacheGroup) {
//   var props = PropertiesService.getScriptProperties();
//   var versionKey = 'VERSION_' + cacheGroup;
//   props.setProperty(versionKey, Date.now().toString());
// }