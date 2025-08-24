const { Stock, Product, Inventory, ProductUnits, Unit, StockTransfer, User } = require('../../models');
const { Op, fn, col, where, literal } = require('sequelize');

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
        attributes: ['id', 'fullname', 'email'],
        required: false
      },
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'fullname', 'email'],
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
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE 0 END)"), 'totalIncoming'],
  // Calculate total outgoing stock
  [literal("SUM(CASE WHEN in_out = 'out' THEN stockQuantity ELSE 0 END)"), 'totalOutgoing'],
  // Calculate net available stock (incoming - outgoing)
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE -stockQuantity END)"), 'availableQuantity']
];

/**
 * Get stock aggregation order clause
 * @returns {Array} Order clause for stock aggregation
 */
const getStockAggregationOrder = () => [
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE -stockQuantity END)"), 'DESC']
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
 * Get simple stock aggregation group clause (without includes)
 * @returns {Array} Simple group clause for stock aggregation without includes
 */
const getSimpleStockAggregationGroup = () => [
  'Stock.product_id', 
  'Stock.inventory_id', 
  'Stock.unit_id'
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
    attributes: ['id', 'fullname','email'],
    required: false
  },
  {
    model: User,
    as: 'receiver',
    attributes: ['id', 'fullname', 'email'],
    required: false
  }
];

/**
 * Build having clause for low stock queries
 * @param {number} threshold - Stock threshold value
 * @returns {Object} Having clause for low stock queries
 */
const buildLowStockHaving = (threshold) => {
  return where(literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE -stockQuantity END)"), Op.lt, threshold);
};

/**
 * Get low stock order clause
 * @returns {Array} Order clause for low stock queries
 */
const getLowStockOrder = () => [
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE -stockQuantity END)"), 'ASC'], 
  [{ model: Unit, as: 'unit' }, 'name', 'ASC']
];

/**
 * Get summary attributes for product stock summary
 * @returns {Array} Array of attributes for product summary
 */
const getProductSummaryAttributes = () => [
  'unit_id',
  // Calculate total incoming stock
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE 0 END)"), 'totalIncoming'],
  // Calculate total outgoing stock
  [literal("SUM(CASE WHEN in_out = 'out' THEN stockQuantity ELSE 0 END)"), 'totalOutgoing'],
  // Calculate net available stock (incoming - outgoing)
  [literal("SUM(CASE WHEN in_out = 'in' THEN stockQuantity ELSE -stockQuantity END)"), 'totalAvailableQuantity'],
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
  getSimpleStockAggregationGroup,
  getFullStockGroup,
  buildTransferWhereClause,
  getStockTransferIncludes,
  buildLowStockHaving,
  getLowStockOrder,
  getProductSummaryAttributes,
  getProductSummaryGroup,
  getInventorySummaryAttributes
};