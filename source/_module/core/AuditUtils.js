const AuditUtils = (function() {
  function getAuditTrail(explicitUserEmail) {
    var email = explicitUserEmail || 'System';
    if (email === 'System') {
      try {
        var user = Session.getActiveUser();
        if (user && user.getEmail()) email = user.getEmail();
      } catch(e) {}
    }
    return { updatedAt: new Date(), updatedBy: email };
  }
  return { getAuditTrail: getAuditTrail };
})();

// bypass auth
// const AuditUtils = (function() {
//   function getAuditTrail(explicitUserEmail) {
//     var email = explicitUserEmail || 'System';
//     if (email === 'System') {
//       // Jangan panggil Session.getActiveUser() untuk menghindari error izin
//       // Coba lihat apakah ada session? Untuk test, kita pakai 'System'
//       email = 'System';
//     }
//     return { updatedAt: new Date(), updatedBy: email };
//   }
//   return { getAuditTrail: getAuditTrail };
// })();