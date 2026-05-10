// const AuditUtils = (function() {
//   function getAuditTrail(explicitUserEmail) {
//     var email = explicitUserEmail || 'System';
//     if (email === 'System') {
//       try {
//         var user = Session.getActiveUser();
//         if (user && user.getEmail()) email = user.getEmail();
//       } catch(e) {}
//     }
//     return { updatedAt: new Date(), updatedBy: email };
//   }
//   return { getAuditTrail: getAuditTrail };
// })();

// error auth
// const AuditUtils = (function() {
//   function getAuditTrail(explicitUserEmail) {
//     var email = explicitUserEmail || 'System';
//     // Jangan panggil Session.getActiveUser() 
//     // agar tidak perlu otorisasi userinfo.email di awal
//     return { updatedAt: new Date(), updatedBy: email };
//   }
//   return { getAuditTrail: getAuditTrail };
// })();

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


// const AuditUtils = (function() {
//   function getAuditTrail(explicitUserEmail) {
//     var email = explicitUserEmail || 'System';
//     // Fallback jika tidak ada email eksplisit (misal untuk developer)
//     if (email === 'System') {
//       try {
//         var user = Session.getActiveUser();
//         if (user && user.getEmail()) email = user.getEmail();
//       } catch(e) {}
//     }
//     return { updatedAt: new Date(), updatedBy: email };
//   }
//   return { getAuditTrail: getAuditTrail };
// })();


// source/_module/core/AuditUtils.js

const AuditUtils = (function() {
  /**
   * Mendapatkan audit trail.
   * @param {string|null} explicitUserEmail - Email user (wajib untuk API mode).
   *                                          Jika null, akan mencoba Session (untuk testing/trigger).
   * @returns {{ updatedAt: Date, updatedBy: string }}
   */
  function getAuditTrail(explicitUserEmail) {
    var email = explicitUserEmail;
    if (!email) {
      // Fallback: coba Session (hanya berfungsi di konteks authorized)
      try {
        var user = Session.getActiveUser();
        if (user && user.getEmail()) {
          email = user.getEmail();
        }
      } catch(e) {
        // Tidak bisa mendapatkan email, gunakan 'System'
        email = 'System';
      }
    }
    return { updatedAt: new Date(), updatedBy: email || 'System' };
  }

  return { getAuditTrail: getAuditTrail };
})();