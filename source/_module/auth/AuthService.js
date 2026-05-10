// source/_module/auth/AuthService.js

/**
 * AuthService v5.0 – Hybrid Spreadsheet Izin + API _e Validation.
 * Digunakan untuk validasi request di semua mode.
 *
 * @module AuthService
 * @requires AppConfig, PropertiesWrapper
 */
const AuthService = (function() {
  /**
   * Cari user berdasarkan email. Return user object atau null.
   * @param {string} email
   * @returns {Object|null}
   */
  function _findUserByEmail(email) {
    const userMaster = ApplicationConfig.dataSources.master.user;
    const userConfig = userMaster.configs[0];
    const adapter = new MasterSheetAdapter({
      spreadsheetId: userMaster.spreadsheetId,
      sheetName: userConfig.sheetName,
      headerRow: userConfig.headerRow,
      startRow: userConfig.startRow,
      fieldMapping: userConfig.fieldMapping
    });
    // Cari yang statuses ACTIVE
    const users = adapter.getAll();
    const normalizedEmail = email.toLowerCase().trim();
    const found = users.filter(function(u) {
      return u.statues === 'ACTIVE' && u.email && u.email.toLowerCase().trim() === normalizedEmail;
    });
    if (found.length === 0) return null;
    // Ambil yang paling baru (seharusnya hanya satu)
    return found[found.length - 1];
  }

  /**
   * Generate SHA-256 hash dari string.
   * @param {string} input
   * @returns {string} hex digest
   */
  function _sha256(input) {
    const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
    return raw.map(function(b) {
      return ('0' + (b & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Generate _e untuk email + salt user. Hanya bisa dipanggil oleh admin.
   * @param {string} email
   * @returns {string} hash _e
   */
  function generateAndReturnUserHash(email) {
    const user = _findUserByEmail(email);
    if (!user) throw new Error('User dengan email ' + email + ' tidak ditemukan.');
    const salt = user.salt;
    if (!salt) throw new Error('User tidak memiliki salt. Hubungi admin.');
    const rawE = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      email.toLowerCase().trim() + salt
    );
    return rawE.map(function(b) {
      return ('0' + (b & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Validasi request berdasarkan email dan _e.
   * @param {string} email
   * @param {string} _e
   * @returns {Object} user object jika valid
   * @throws {Error} jika tidak valid
   */
  function validateRequest(email, _e) {
    if (!email || !_e) throw new Error('Email dan _e harus diisi.');
    const user = _findUserByEmail(email);
    if (!user) throw new Error('Pengguna dengan email ' + email + ' tidak ditemukan.');
    const computedE = _sha256(email.toLowerCase().trim() + user.salt);
    if (computedE !== _e) throw new Error('Validasi _e gagal. Kredensial tidak valid.');
    // Jangan kembalikan passwordHash dan salt
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Login dengan email dan password. Return user object + _e.
   * Hanya untuk Web App (bukan script editor).
   * @param {string} email
   * @param {string} password
   * @returns {{ user: Object, _e: string }}
   */
  function login(email, password) {
    if (!email || !password) throw new Error('Email dan password wajib diisi.');
    const user = _findUserByEmail(email);
    if (!user) throw new Error('Email tidak ditemukan.');
    const computedHash = _sha256(password + user.salt);
    if (computedHash !== user.passwordHash) throw new Error('Password salah.');
    const _e = _sha256(email.toLowerCase().trim() + user.salt);
    const { passwordHash, salt, ...safeUser } = user;
    return { user: safeUser, _e: _e };
  }

  return {
    validateRequest: validateRequest,
    generateAndReturnUserHash: generateAndReturnUserHash,
    login: login
  };
})();