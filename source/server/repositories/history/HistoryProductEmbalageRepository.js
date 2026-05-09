// source/server/repositories/history/HistoryProductEmbalageRepository.js

/**
 * Repository untuk riwayat embalage produk (ALL_PEMB).
 * Lapisan abstraksi antara service dan adapter history.
 *
 * @param {HistoryProductEmbalageReaderAdapter} adapter
 */
function HistoryProductEmbalageRepository(adapter) {
  this.adapter = adapter;

  /**
   * @param {string} batch
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByBatch = function(batch) {
    return this.adapter.findByBatch(batch);
  };

  /**
   * @param {string} kodeBarang
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByKodeBarang = function(kodeBarang) {
    return this.adapter.findByKodeBarang(kodeBarang);
  };

  /**
   * @param {string} namaBarang
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByNamaBarang = function(namaBarang) {
    return this.adapter.findByNamaBarang(namaBarang);
  };

  /**
   * @param {string} namaKonsumen
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByNamaKonsumen = function(namaKonsumen) {
    return this.adapter.findByNamaKonsumen(namaKonsumen);
  };

  /**
   * @param {string} standardField
   * @param {string} value
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.findByField = function(standardField, value) {
    return this.adapter.findByField(standardField, value);
  };

  /**
   * @param {string} year
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.getByYear = function(year) {
    return this.adapter.getByYear(year);
  };

  /**
   * @returns {Array<{ year: string, record: Object }>}
   */
  this.getAll = function() {
    return this.adapter.getAll();
  };
}