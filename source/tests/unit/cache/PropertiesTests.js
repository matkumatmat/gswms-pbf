function inspectProperties() {
  var props = PropertiesService.getScriptProperties();
  var keys = props.getKeys().filter(function(k) { return k.indexOf('VERSION_TRANS_2025_ALL_RCV') === 0; });
  keys.forEach(function(k) {
    Logger.log(k + ' = ' + props.getProperty(k));
  });
}
function manualVerify() {
  var group = 'TRANS_2025_ALL_RCV';
  var v1 = CacheManager.getVersion(group);
  CacheManager.invalidate(group);
  var v2 = CacheManager.getVersion(group);
  Logger.log('vBefore=' + v1 + ' vAfter=' + v2);
}