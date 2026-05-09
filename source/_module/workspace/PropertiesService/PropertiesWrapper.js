// source/_module/workspace/PropertiesService/PropertiesWrapper.js
const PropertiesWrapper = (function() {
  function getProps() {
    return PropertiesService.getScriptProperties();
  }

  return {
    get: function(key) {
      const val = getProps().getProperty(key);
      return val ? JSON.parse(val) : null;
    },
    set: function(key, value) {
      getProps().setProperty(key, JSON.stringify(value));
    },
    delete: function(key) {
      getProps().deleteProperty(key);
    },
    getKeys: function() {
      return getProps().getKeys();
    },
    getAll: function() {
      const props = getProps().getProperties();
      const result = {};
      Object.keys(props).forEach(k => {
        try { result[k] = JSON.parse(props[k]); } catch(e) { result[k] = props[k]; }
      });
      return result;
    },
    setAll: function(obj) {
      const toSet = {};
      Object.keys(obj).forEach(k => {
        toSet[k] = JSON.stringify(obj[k]);
      });
      getProps().setProperties(toSet);
    }
  };
})();