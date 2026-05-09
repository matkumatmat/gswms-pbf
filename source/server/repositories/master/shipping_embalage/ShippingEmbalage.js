// source/server/repositories/shippingEmbalage/ShippingEmbalageMasterRepository.js

function ShippingEmbalageMasterRepository(adapter) {
  this.adapter = adapter;
  this.getAll      = () => this.adapter.getAll();
  this.findById    = (id) => this.adapter.findById(id);
  this.findByField = (field, value) => this.adapter.findByField(field, value);
  this.create      = (data) => this.adapter.append(data);
  this.update      = (id, data) => this.adapter.updateById(id, data);
  this.touchGlobalCells = () => this.adapter.updateGlobalCells();
}