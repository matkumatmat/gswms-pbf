// source/server/repositories/transactional/TransactionalProductEmbalageRepository.js

/**
 * Repository untuk embalage produk (ALL_PEMB).
 * Bertindak sebagai lapisan abstraksi antara service dan adapter.
 * Mendelegasikan semua operasi ke adapter yang di-inject.
 *
 * @param {TransactionalProductEmbalageSheetAdapter} adapter
 */
function TransactionalProductEmbalageRepository(adapter) {
  this.adapter = adapter;

  /** Ambil semua data (via paginated besar). */
  this.getAll = function() { return this.adapter.getPaginated(1, 999999).data; };

  /**
   * @param {string} id
   * @returns {Object|null}
   */
  this.findById = function(id) { return this.adapter.findById(id); };

  /**
   * Cari berdasarkan nama header (bukan standard field).
   * @param {string} headerName
   * @param {string} value
   * @returns {Object[]}
   */
  this.findByField = function(headerName, value) {
    return this.adapter.findByField(headerName, value);
  };

  /**
   * @param {Object} data - Raw object dengan key = header name
   */
  this.create = function(data) { this.adapter.append(data); };

  /**
   * @param {string} id
   * @param {Object} data
   */
  this.update = function(id, data) { this.adapter.updateById(id, data); };

  /**
   * @param {string} id
   */
  this.delete = function(id) { this.adapter.deleteById(id); };
}