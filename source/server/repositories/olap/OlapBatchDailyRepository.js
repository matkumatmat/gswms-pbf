/**
 * Repository untuk OLAP_BATCH_DAILY.
 * Lapisan abstraksi di atas adapter (walaupun tipis, tetap jaga konsistensi DDD).
 * @param {OlapBatchDailyAdapter} adapter
 */
function OlapBatchDailyRepository(adapter) {
  this.adapter = adapter;

  /** @returns {Object[]} */
  this.getAll = () => this.adapter.getAll();

  /** @param {Object[]} data */
  this.overwriteAll = (data) => this.adapter.overwriteAll(data);

  /** @param {Date} now @param {string} user */
  this.updateGlobalCells = (now, user) => this.adapter.updateGlobalCells(now, user);
}