/**
 * BaseService.js
 * Pondasi untuk semua domain service.
 * Menyediakan: filtering, processing, pagination pattern.
 */

class BaseService {
    constructor(repo, defaultLimit = 500) {
        this.repo = repo;
        this.defaultLimit = defaultLimit;
        this.jsonFields = [];
    }

    // ========================================================================
    // FILTER: Basic & Status (Reusable)
    // ========================================================================
    _filterBasic(item, requiredField = 'id') {
        if (!item) return false;
        if (requiredField && (!item[requiredField] || String(item[requiredField]).trim() === '')) {
            return false;
        }
        return true;
    }

    _filterStatus(item, field = 'sysStatus', allowedStatuses) {
        if (!allowedStatuses || !allowedStatuses.length) return true;
        const status = String(item[field] || '').toUpperCase().trim();
        return allowedStatuses.map(s => String(s).toUpperCase()).includes(status);
    }

    _applyFilters(items, filterConfig, requiredField = 'id') {
        if (!filterConfig) return items;
        
        return items.filter(item => {
            if (!this._filterBasic(item, requiredField)) return false;
            
            if (filterConfig.allowedStatuses) {
                const field = filterConfig.statusField || 'sysStatus';
                if (!this._filterStatus(item, field, filterConfig.allowedStatuses)) return false;
            }
            
            if (filterConfig.custom && typeof filterConfig.custom === 'function') {
                return filterConfig.custom(item);
            }
            
            return true;
        });
    }

    // ========================================================================
    // PROCESSING: JSON Fields (Configurable)
    // ========================================================================
    _processJsonFields(items, fields = null) {
        const jsonFields = fields || this.jsonFields;
        if (!jsonFields || jsonFields.length === 0) return items;
        
        return items.map(item => {
            jsonFields.forEach(key => {
                if (item[key] && typeof item[key] === 'string') {
                    try { item[key] = JSON.parse(item[key]); } catch(e) {}
                }
            });
            return item;
        });
    }

    // ========================================================================
    // QUERY: Dynamic Filter Generator (Reusable)
// Di dalam BaseService.js, method _createDefaultFilter

    _createDefaultFilter(filters, skipKeys = ['sysStatusIn']) {
        return function(item) {
        for (var key in filters) {
            if (skipKeys.indexOf(key) !== -1) continue; 
            
            var filterVal = filters[key];
            if (filterVal === undefined || filterVal === null) continue;
            
            var itemVal = String(item[key] || '');
            var itemUpper = itemVal.toUpperCase().trim();
            
            if (Array.isArray(filterVal)) {
                // IN operator: cek apakah itemVal ada di array
                var allowed = filterVal.map(function(v) { return String(v).toUpperCase().trim(); });
                if (allowed.indexOf(itemUpper) === -1) return false;
            } 
            else if (String(filterVal).indexOf('*') !== -1) {
                // CONTAINS operator (wildcard): *keyword*
                var searchVal = String(filterVal).replace(/\*/g, '').toUpperCase().trim();
                if (itemUpper.indexOf(searchVal) === -1) return false;
            } 
            else {
                // EXACT match (default): status: 'RECEIVED', sysStatus: 'ACTIVE'
                var filterUpper = String(filterVal).toUpperCase().trim();
                if (itemUpper !== filterUpper) return false;
            }
        }
        return true;
    };
}

    // ========================================================================
    // SCHEMA: Projection Helper
    // ========================================================================
    _project(items, schemaName) {
        if (!schemaName || !SchemaRegistry[schemaName]) return items;
        if (!items || items.length === 0) return [];
        
        // Handle single item or array
        var isArray = Array.isArray(items);
        var arr = isArray ? items : [items];
        
        var result = arr.map(function(item) {
            return projectToSchema(item, schemaName);
        });
        
        return isArray ? result : result[0];
    }
}