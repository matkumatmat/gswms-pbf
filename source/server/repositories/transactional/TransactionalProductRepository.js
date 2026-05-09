// source/server/repositories/transactional/TransactionalRepository.js

function TransactionalRepository(adapter) {
  this.adapter = adapter;

  this.getAll = function() { return this.adapter.getAll(); };
  this.findById = function(id) { return this.adapter.findById(id); };
  this.findByField = function(field, value) { return this.adapter.findByField(field, value); };
  this.create = function(data) { this.adapter.append(data); };
  this.update = function(id, data) { this.adapter.updateById(id, data); };
  this.delete = function(id) { this.adapter.deleteById(id); };
}