const { Stock, Product, Inventory, ProductUnits, Unit, StockTransfer, User } = require('../../models');
const { Op, fn, col, where } = require('sequelize');

/**
 * Get standard includes for stock queries with full associations
 * @returns {Array} Array of include objects for Sequelize queries
 */
const getStockIncludes = () => [
  {
    model: Product,
    as: 'product',
    attributes: ['id', 'productName', 'description'],
    include: [
      {
        model: ProductUnits,
        as: 'productUnits',
        include: [
          {
            model: Unit,
            as: 'unit',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  },
  {
    model: Inventory,
    as: 'inventory',
    attributes: ['id', 'inventoryName', 'address', 'contactNumber']
  },
  {
    model: Unit,
    as: 'unit',
    attributes: ['id', 'name']
  },
  {
    model: StockTransfer,
    as: 'transfers',
    required: false,
    include: [
      {
        model: Inventory,
        as: 'sourceInventory',
        attributes: ['id', 'inventoryName']
      },
      {
        model: Inventory,
        as: 'targetInventory',
        attributes: ['id', 'inventoryName']
      },
      {
        model: User,
        as: 'transferrer',
        attributes: ['id', 'username', 'firstName', 'lastName'],
        required: false
      },
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'username', 'firstName', 'lastName'],
        required: false
      }
    ]
  }
];

/**
 * Get slim includes for aggregate queries to avoid hasMany join multiplication
 * @returns {Array} Array of include objects for aggregated queries
 */
const getAggregatedIncludes = () => [
  {
    model: Product,
    as: 'product',
    attributes: ['id', 'productName', 'description']
  },
  {
    model: Inventory,
    as: 'inventory',
    attributes: ['id', 'inventoryName', 'address', 'contactNumber']
  },
  {
    model: Unit,
    as: 'unit',
    attributes: ['id', 'name']
  }
];

/**
 * Get stock aggregation attributes for calculating totals
 * @returns {Array} Array of attributes for stock aggregation
 */
const getStockAggregationAttributes = () => [
  'product_id', 
  'inventory_id', 
  'unit_id',
  // Calculate total incoming stock
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      0
    )
  ), 'totalIncoming'],
  // Calculate total outgoing stock
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'out'), col('stockQuantity'),
      0
    )
  ), 'totalOutgoing'],
  // Calculate net available stock (incoming - outgoing)
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      fn('*', -1, col('stockQuantity'))
    )
  ), 'availableQuantity']
];

/**
 * Get stock aggregation order clause
 * @returns {Array} Order clause for stock aggregation
 */
const getStockAggregationOrder = () => [
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      fn('*', -1, col('stockQuantity'))
    )
  ), 'DESC']
];

/**
 * Get stock aggregation group clause
 * @returns {Array} Group clause for stock aggregation
 */
const getStockAggregationGroup = () => [
  'Stock.product_id', 
  'Stock.inventory_id', 
  'Stock.unit_id', 
  'product.id', 
  'inventory.id', 
  'unit.id'
];

/**
 * Get group clause for queries with full stock includes
 * @returns {Array} Group clause for full stock queries
 */
const getFullStockGroup = () => [
  'Stock.product_id', 
  'Stock.inventory_id', 
  'Stock.unit_id', 
  'product.id', 
  'product->productUnits.id', 
  'product->productUnits->unit.id', 
  'inventory.id', 
  'unit.id'
];

/**
 * Build stock transfer where clause based on user role
 * @param {string} userRole - User role
 * @param {Array} managedInventoryIds - Array of managed inventory IDs
 * @returns {Object} Where clause for stock transfers
 */
const buildTransferWhereClause = (userRole, managedInventoryIds) => {
  if (userRole === 'admin' && managedInventoryIds && managedInventoryIds.length > 0) {
    return {
      [Op.or]: [
        { sourceInventory_id: { [Op.in]: managedInventoryIds } },
        { targetInventory_id: { [Op.in]: managedInventoryIds } }
      ]
    };
  }
  return {};
};

/**
 * Get stock transfer includes
 * @returns {Array} Array of include objects for stock transfer queries
 */
const getStockTransferIncludes = () => [
  {
    model: Inventory,
    as: 'sourceInventory',
    attributes: ['id', 'inventoryName']
  },
  {
    model: Inventory,
    as: 'targetInventory',
    attributes: ['id', 'inventoryName']
  },
  {
    model: User,
    as: 'transferrer',
    attributes: ['id', 'username', 'firstName', 'lastName'],
    required: false
  },
  {
    model: User,
    as: 'receiver',
    attributes: ['id', 'username', 'firstName', 'lastName'],
    required: false
  }
];

/**
 * Build having clause for low stock queries
 * @param {number} threshold - Stock threshold value
 * @returns {Object} Having clause for low stock queries
 */
const buildLowStockHaving = (threshold) => {
  return where(fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      fn('*', -1, col('stockQuantity'))
    )
  ), Op.lt, threshold);
};

/**
 * Get low stock order clause
 * @returns {Array} Order clause for low stock queries
 */
const getLowStockOrder = () => [
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      fn('*', -1, col('stockQuantity'))
    )
  ), 'ASC'], 
  [{ model: Unit, as: 'unit' }, 'name', 'ASC']
];

/**
 * Get summary attributes for product stock summary
 * @returns {Array} Array of attributes for product summary
 */
const getProductSummaryAttributes = () => [
  'unit_id',
  // Calculate total incoming stock
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      0
    )
  ), 'totalIncoming'],
  // Calculate total outgoing stock
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'out'), col('stockQuantity'),
      0
    )
  ), 'totalOutgoing'],
  // Calculate net available stock (incoming - outgoing)
  [fn('SUM', 
    fn('CASE', 
      where(col('in_out'), 'in'), col('stockQuantity'),
      fn('*', -1, col('stockQuantity'))
    )
  ), 'totalAvailableQuantity'],
  [fn('COUNT', col('Stock.id')), 'transactionCount']
];

/**
 * Get summary group clause for product summary
 * @returns {Array} Group clause for product summary
 */
const getProductSummaryGroup = () => ['unit_id', 'unit.id', 'unit.name'];

/**
 * Get inventory summary attributes
 * @returns {Array} Array of attributes for inventory summary
 */
const getInventorySummaryAttributes = () => [
  'unit_id',
  [fn('SUM', col('stockQuantity')), 'totalQuantity'],
  [fn('COUNT', col('Stock.id')), 'productCount']
];

module.exports = {
  getStockIncludes,
  getAggregatedIncludes,
  getStockAggregationAttributes,
  getStockAggregationOrder,
  getStockAggregationGroup,
  getFullStockGroup,
  buildTransferWhereClause,
  getStockTransferIncludes,
  buildLowStockHaving,
  getLowStockOrder,
  getProductSummaryAttributes,
  getProductSummaryGroup,
  getInventorySummaryAttributes
};