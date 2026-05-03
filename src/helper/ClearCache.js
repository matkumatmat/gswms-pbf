function BUSTER_CACHE() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("Cache has been reset");
}

function testLogin() {
  const result = AuthService.login({ email: 'alphatest@gmail.com', password: 'alpha001?' });
  console.log(result);
}