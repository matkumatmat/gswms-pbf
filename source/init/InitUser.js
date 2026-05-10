// source/init/InitUser.js

function seedAdminUser() {
  // ─── Ambil config dari AppConfig ──────────────────
  var userMaster = ApplicationConfig.dataSources.master.user;
  if (!userMaster || !userMaster.spreadsheetId) {
    throw new Error('AppConfig.dataSources.master.user belum diisi dengan benar.');
  }
  var userCfg = userMaster.configs[0];
  if (!userCfg || !userCfg.sheetName) {
    throw new Error('Config USER (sheetName) tidak ditemukan di master.user.configs.');
  }

  var spreadsheetId = userMaster.spreadsheetId;
  var sheetName     = userCfg.sheetName;      // "_USER"
  var headerRow     = userCfg.headerRow;      // 5

  var email    = 'admin@pbf.com';
  var password = 'Admin123!';
  var role     = 'ADMIN';

  // ─── Generate Salt & Hash ─────────────────────────
  var saltBytes = [];
  for (var i = 0; i < 16; i++) {
    saltBytes.push(Math.floor(Math.random() * 256));
  }
  var salt = Utilities.base64Encode(saltBytes);

  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + salt
  );
  var passwordHash = rawHash.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');

  var rawE = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email.toLowerCase().trim() + salt
  );
  var eHash = rawE.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');

  // ─── Susun row data ──────────────────────────────
  var now = new Date();
  var rowData = {
    'ID':            Utilities.getUuid(),
    'CREATED AT':    now.toISOString(),
    'UPDATED AT':    now.toISOString(),
    'UPDATED BY':    'SYSTEM',
    'STATUES':       'ACTIVE',
    'EMAIL':         email,
    'PASSWORD HASH': passwordHash,
    'SALT':          salt,
    'ROLE':          role,
    'NAMA LENGKAP':  'Administrator'
  };

  // ─── Tulis ke sheet ──────────────────────────────
  SheetWriter.appendRowWithHeaderAtRow(
    spreadsheetId,
    sheetName,
    rowData,
    headerRow
  );

  // ─── Logging ────────────────────────────────────
  Logger.log('Admin user berhasil dibuat:');
  Logger.log('  Email    : ' + email);
  Logger.log('  Password : ' + password);
  Logger.log('  _e (API) : ' + eHash);
  Logger.log('  Simpan _e untuk digunakan di AppSheet Config atau Web App.');
}