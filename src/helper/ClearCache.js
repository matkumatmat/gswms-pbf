function BUSTER_CACHE() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("Cache has been reset");
}