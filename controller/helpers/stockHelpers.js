const { Manages } = require('../../models');

/**
 * Get managed inventory IDs for admin users
 * @param {number} userId - User ID
 * @param {string} userRole - User role (admin, superadmin, etc.)
 * @returns {Array|null} Array of inventory IDs or null for superadmin
 */
const getManagedInventoryIds = async (userId, userRole) => {
  if (userRole === 'superadmin') {
    return null; // superadmin has access to all inventories
  }
  
  if (userRole === 'admin') {
    const managedInventories = await Manages.findAll({
      where: { user_id: userId },
      attributes: ['inventory_id']
    });
    return managedInventories.map(m => m.inventory_id);
  }
  
  return []; // other roles have no inventory access
};

/**
 * Validate inventory access for admin users
 * @param {number} userId - User ID
 * @param {string} userRole - User role
 * @param {number} inventoryId - Inventory ID to validate
 * @returns {boolean} True if user has access, false otherwise
 */
const validateInventoryAccess = async (userId, userRole, inventoryId) => {
  if (userRole === 'superadmin') {
    return true; // superadmin has access to all inventories
  }
  
  if (userRole === 'admin') {
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    return managedInventoryIds.includes(parseInt(inventoryId));
  }
  
  return false; // other roles have no inventory access
};

/**
 * Build where clause for inventory filtering based on user role
 * @param {string} userRole - User role
 * @param {Array} managedInventoryIds - Array of managed inventory IDs
 * @param {Object} baseWhere - Base where clause to extend
 * @returns {Object} Extended where clause
 */
const buildInventoryWhereClause = (userRole, managedInventoryIds, baseWhere = {}) => {
  if (userRole === 'admin' && managedInventoryIds && managedInventoryIds.length > 0) {
    return {
      ...baseWhere,
      inventory_id: { [require('sequelize').Op.in]: managedInventoryIds }
    };
  }
  return baseWhere;
};

/**
 * Check if admin user has no managed inventories and return appropriate response
 * @param {string} userRole - User role
 * @param {Array} managedInventoryIds - Array of managed inventory IDs
 * @param {Object} res - Express response object
 * @returns {boolean} True if should return early (no access), false to continue
 */
const checkAdminInventoryAccess = (userRole, managedInventoryIds, res) => {
  if (userRole === 'admin' && managedInventoryIds.length === 0) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You are not assigned to manage any inventories.'
    });
    return true;
  }
  return false;
};

/**
 * Process aggregated stock results with calculations
 * @param {Array} stockResults - Raw stock results from database
 * @returns {Array} Processed stock results
 */
const processAggregatedStock = (stockResults) => {
  return stockResults.map(r => {
    const row = r.toJSON ? r.toJSON() : r;
    row.totalIncoming = Number(row.totalIncoming || 0);
    row.totalOutgoing = Number(row.totalOutgoing || 0);
    row.availableQuantity = Number(row.availableQuantity || 0);
    
    // Verify calculation: availableQuantity = totalIncoming - totalOutgoing
    const calculatedAvailable = row.totalIncoming - row.totalOutgoing;
    row.availableQuantity = calculatedAvailable;
    
    // Keep backward compatibility by also setting stockQuantity
    row.stockQuantity = row.availableQuantity;
    
    return row;
  });
};

/**
 * Group stock transfers by product, inventory, and unit combination
 * @param {Array} stockTransfers - Array of stock transfer records
 * @returns {Object} Grouped transfers map
 */
const groupTransfersByStock = (stockTransfers) => {
  const transfersMap = {};
  stockTransfers.forEach(transfer => {
    const key = `${transfer.stock.product_id}-${transfer.stock.inventory_id}-${transfer.stock.unit_id}`;
    if (!transfersMap[key]) {
      transfersMap[key] = [];
    }
    transfersMap[key].push(transfer);
  });
  return transfersMap;
};

/**
 * Attach transfers to aggregated stock results
 * @param {Array} aggregatedResults - Processed stock results
 * @param {Object} transfersMap - Grouped transfers map
 * @returns {Array} Results with attached transfers
 */
const attachTransfersToStock = (aggregatedResults, transfersMap) => {
  return aggregatedResults.map(item => {
    const key = `${item.product_id}-${item.inventory_id}-${item.unit_id}`;
    item.transfers = transfersMap[key] || [];
    return item;
  });
};

module.exports = {
  getManagedInventoryIds,
  validateInventoryAccess,
  buildInventoryWhereClause,
  checkAdminInventoryAccess,
  processAggregatedStock,
  groupTransfersByStock,
  attachTransfersToStock
};