// source/_module/core/SchemaUtils.js
const SchemaUtils = (function() {
  // Field mapping untuk kasus tertentu jika nama field berbeda
  const FIELD_ALIAS = {
    // Tidak ada alias untuk batch record karena sudah sesuai
  };

  /**
   * Proyeksi objek sesuai schema yang terdaftar di SchemaRegistry
   * @param {Object} item - objek sumber
   * @param {string} schemaName - nama schema di SchemaRegistry
   * @returns {Object} objek hasil proyeksi
   */
  function projectToSchema(item, schemaName) {
    const schema = SchemaRegistry[schemaName];
    if (!schema || schema.length === 0) return item;

    const result = {};
    for (let i = 0; i < schema.length; i++) {
      const fieldName = schema[i];
      const sourceField = FIELD_ALIAS[fieldName] || fieldName;
      result[fieldName] = item[sourceField] !== undefined ? item[sourceField] : null;
    }
    return result;
  }

  /**
   * Proyeksi array objek
   * @param {Array<Object>} items
   * @param {string} schemaName
   * @returns {Array<Object>}
   */
  function projectArrayToSchema(items, schemaName) {
    if (!schemaName || !SchemaRegistry[schemaName]) return items;
    return items.map(item => projectToSchema(item, schemaName));
  }

  return {
    projectToSchema: projectToSchema,
    projectArrayToSchema: projectArrayToSchema
  };
})();