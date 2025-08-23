const { Stock, Product, Inventory, Unit, StockTransfer, User, sequelize } = require('../models');
const { Op, fn, col, where } = require('sequelize');

// Import helper modules
const {
  getManagedInventoryIds,
  validateInventoryAccess,
  buildInventoryWhereClause,
  checkAdminInventoryAccess,
  processAggregatedStock,
  groupTransfersByStock,
  attachTransfersToStock
} = require('./helpers/stockHelpers');

const {
  validateStockCreationFields,
  validateTransferMethod,
  validateStockQuantity,
  validateInOutField,
  validateOperation,
  validateEntitiesExist,
  validateThreshold
} = require('./helpers/stockValidators');

const {
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
} = require('./helpers/stockQueries');

// ==================== STOCK RETRIEVAL ENDPOINTS ====================

/**
 * Get all stock records with role-based filtering
 */
const getAllStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    if (checkAdminInventoryAccess(userRole, managedInventoryIds, res)) {
      return;
    }
    
    const whereClause = buildInventoryWhereClause(userRole, managedInventoryIds);
    
    const stock = await Stock.findAll({
      attributes: getStockAggregationAttributes(),
      where: whereClause,
      include: getAggregatedIncludes(),
      group: getStockAggregationGroup(),
      order: getStockAggregationOrder()
    });

    const aggregated = processAggregatedStock(stock);

    // Fetch stock transfers
    let stockTransfers = [];
    if (aggregated.length > 0) {
      const transferWhereClause = buildTransferWhereClause(userRole, managedInventoryIds);
      
      stockTransfers = await StockTransfer.findAll({
        where: transferWhereClause,
        include: [
          {
            model: Stock,
            as: 'stock',
            where: {
              [Op.or]: aggregated.map(item => ({
                product_id: item.product_id,
                inventory_id: item.inventory_id,
                unit_id: item.unit_id
              }))
            }
          },
          ...getStockTransferIncludes()
        ]
      });
    }

    const transfersMap = groupTransfersByStock(stockTransfers);
    const finalResults = attachTransfersToStock(aggregated, transfersMap);
    
    res.status(200).json({
      success: true,
      message: 'Stock records retrieved successfully (incoming stock - outgoing stock)',
      data: finalResults
    });
  } catch (error) {
    console.error('Error fetching stock records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock records',
      error: error.message
    });
  }
};

/**
 * Get stock record by ID with access validation
 */
const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const stock = await Stock.findByPk(id, {
      include: getStockIncludes()
    });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, stock.inventory_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to view stock from this inventory.'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Stock record retrieved successfully',
      data: stock
    });
  } catch (error) {
    console.error('Error fetching stock record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock record',
      error: error.message
    });
  }
};

/**
 * Get stock by product with role-based filtering
 */
const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    if (checkAdminInventoryAccess(userRole, managedInventoryIds, res)) {
      return;
    }
    
    const whereClause = buildInventoryWhereClause(userRole, managedInventoryIds, { product_id: productId });
    
    const stock = await Stock.findAll({
      attributes: getStockAggregationAttributes(),
      where: whereClause,
      include: getAggregatedIncludes(),
      group: getStockAggregationGroup(),
      order: getStockAggregationOrder()
    });

    const aggregated = processAggregatedStock(stock);
    
    res.status(200).json({
      success: true,
      message: `Stock for product '${product.productName}' retrieved successfully`,
      data: aggregated
    });
  } catch (error) {
    console.error('Error fetching stock by product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock by product',
      error: error.message
    });
  }
};

/**
 * Get stock by inventory with access validation
 */
const getStockByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, inventoryId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to view this inventory.'
        });
      }
    }
    
    const stock = await Stock.findAll({
      attributes: getStockAggregationAttributes(),
      where: { inventory_id: inventoryId },
      include: getAggregatedIncludes(),
      group: getStockAggregationGroup(),
      order: getStockAggregationOrder()
    });

    const aggregated = processAggregatedStock(stock);
    
    res.status(200).json({
      success: true,
      message: `Stock for inventory '${inventory.inventoryName}' retrieved successfully`,
      data: aggregated
    });
  } catch (error) {
    console.error('Error fetching stock by inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock by inventory',
      error: error.message
    });
  }
};

/**
 * Get low stock items with role-based filtering
 */
const getLowStock = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const th = validateThreshold(threshold);
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    if (checkAdminInventoryAccess(userRole, managedInventoryIds, res)) {
      return;
    }
    
    const whereClause = buildInventoryWhereClause(userRole, managedInventoryIds);
    
    const lowStock = await Stock.findAll({
      attributes: getStockAggregationAttributes(),
      where: whereClause,
      include: getStockIncludes(),
      group: getFullStockGroup(),
      having: buildLowStockHaving(th),
      order: getLowStockOrder()
    });

    const aggregated = processAggregatedStock(lowStock);
    
    res.status(200).json({
      success: true,
      message: `Low stock items (below ${th}) retrieved successfully`,
      data: aggregated
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items',
      error: error.message
    });
  }
};

// ==================== STOCK MODIFICATION ENDPOINTS ====================

/**
 * Create new stock record with validation and access control
 */
const createStock = async (req, res) => {
  try {
    const { stockQuantity, unit_id, product_id, inventory_id, method, in_out, targetInventoryId, transferredBy, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate required fields
    const fieldsValidation = validateStockCreationFields(req.body);
    if (!fieldsValidation.success) {
      return res.status(400).json(fieldsValidation);
    }
    
    // Validate inventory access for admin users
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, inventory_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to manage this inventory.'
        });
      }
      
      // Validate target inventory access for transfers
      if (method === 'transfer' && in_out === 'out' && targetInventoryId) {
        const hasTargetAccess = await validateInventoryAccess(userId, userRole, targetInventoryId);
        if (!hasTargetAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not authorized to transfer to the target inventory.'
          });
        }
      }
    }
    
    // Validate transfer method
    const transferValidation = validateTransferMethod(req.body);
    if (!transferValidation.success) {
      return res.status(400).json(transferValidation);
    }
    
    // Validate stock quantity
    const quantityValidation = validateStockQuantity(stockQuantity);
    if (!quantityValidation.success) {
      return res.status(400).json(quantityValidation);
    }
    
    // Validate in_out field
    const inOutValidation = validateInOutField(in_out);
    if (!inOutValidation.success) {
      return res.status(400).json(inOutValidation);
    }
    
    // Validate entities exist
    const entitiesValidation = await validateEntitiesExist(req.body);
    if (!entitiesValidation.success) {
      return res.status(404).json(entitiesValidation);
    }
    
    // Check available stock for outgoing transactions
    if (in_out === 'out') {
      const currentStock = await Stock.findAll({
        attributes: getStockAggregationAttributes(),
        where: { product_id, inventory_id, unit_id },
        group: getStockAggregationGroup(),
        raw: true
      });
      
      const availableQuantity = currentStock[0]?.availableQuantity || 0;
      
      if (availableQuantity < stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${availableQuantity}, Requested: ${stockQuantity}`,
          availableQuantity: Number(availableQuantity),
          requestedQuantity: stockQuantity
        });
      }
    }

    // Create stock record
    const newStock = await Stock.create({
      stockQuantity,
      unit_id,
      product_id,
      inventory_id,
      method: method || 'manual',
      in_out,
      notes
    });

    // Handle transfer logic
    if (method === 'transfer' && in_out === 'out' && targetInventoryId) {
      // Create corresponding 'in' record for target inventory
      await Stock.create({
        stockQuantity,
        unit_id,
        product_id,
        inventory_id: targetInventoryId,
        method: 'transfer',
        in_out: 'in',
        notes: `Transfer from inventory ${inventory_id}`
      });

      // Create transfer record
      await StockTransfer.create({
        stock_id: newStock.id,
        sourceInventory_id: inventory_id,
        targetInventory_id: targetInventoryId,
        transferredBy: transferredBy || userId,
        transferDate: new Date(),
        notes
      });
    }

    // Return created stock record with associations
    const createdStock = await Stock.findByPk(newStock.id, {
      include: getStockIncludes()
    });
    
    res.status(201).json({
      success: true,
      message: 'Stock record created successfully',
      data: createdStock
    });
  } catch (error) {
    console.error('Error creating stock record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating stock record',
      error: error.message
    });
  }
};

/**
 * Update stock record with validation and access control
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, unit_id, product_id, inventory_id, method, in_out } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    // Validate inventory access for admin users
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, stock.inventory_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to update stock in this inventory.'
        });
      }
      
      // Validate access to new inventory if being changed
      if (inventory_id && inventory_id !== stock.inventory_id) {
        const hasNewInventoryAccess = await validateInventoryAccess(userId, userRole, inventory_id);
        if (!hasNewInventoryAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not authorized to move stock to the specified inventory.'
          });
        }
      }
    }
    
    // Validate fields if provided
    if (stockQuantity !== undefined) {
      const quantityValidation = validateStockQuantity(stockQuantity);
      if (!quantityValidation.success) {
        return res.status(400).json(quantityValidation);
      }
    }
    
    if (in_out) {
      const inOutValidation = validateInOutField(in_out);
      if (!inOutValidation.success) {
        return res.status(400).json(inOutValidation);
      }
    }
    
    // Check available stock for outgoing transactions
    if ((in_out === 'out' || stock.in_out === 'out') && stockQuantity !== undefined) {
      const finalStockQuantity = stockQuantity;
      const finalProductId = product_id || stock.product_id;
      const finalInventoryId = inventory_id || stock.inventory_id;
      const finalUnitId = unit_id || stock.unit_id;
      
      const currentStock = await Stock.findAll({
        attributes: getStockAggregationAttributes(),
        where: {
          product_id: finalProductId,
          inventory_id: finalInventoryId,
          unit_id: finalUnitId,
          id: { [Op.ne]: id }
        },
        group: getStockAggregationGroup(),
        raw: true
      });
      
      const availableQuantity = currentStock[0]?.availableQuantity || 0;
      
      if (availableQuantity < finalStockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${availableQuantity}, Requested: ${finalStockQuantity}`,
          availableQuantity: Number(availableQuantity),
          requestedQuantity: finalStockQuantity
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (unit_id) updateData.unit_id = unit_id;
    if (product_id) updateData.product_id = product_id;
    if (inventory_id) updateData.inventory_id = inventory_id;
    if (method) updateData.method = method;
    if (in_out) updateData.in_out = in_out;
    
    await stock.update(updateData);
    
    const updatedStock = await Stock.findByPk(id, {
      include: getStockIncludes()
    });
    
    res.status(200).json({
      success: true,
      message: 'Stock record updated successfully',
      data: updatedStock
    });
  } catch (error) {
    console.error('Error updating stock record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock record',
      error: error.message
    });
  }
};

/**
 * Delete stock record with access validation
 */
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, stock.inventory_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to delete stock from this inventory.'
        });
      }
    }
    
    await stock.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Stock record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting stock record',
      error: error.message
    });
  }
};

/**
 * Update stock quantity with add/subtract operations
 */
const updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, operation } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate required fields
    if (quantityChange === undefined || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity change and operation are required'
      });
    }
    
    const operationValidation = validateOperation(operation);
    if (!operationValidation.success) {
      return res.status(400).json(operationValidation);
    }
    
    const quantityValidation = validateStockQuantity(quantityChange);
    if (!quantityValidation.success) {
      return res.status(400).json(quantityValidation);
    }
    
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, stock.inventory_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to update stock in this inventory.'
        });
      }
    }

    // Calculate new quantity
    let newQuantity;
    if (operation === 'ADD') {
      newQuantity = stock.stockQuantity + quantityChange;
    } else {
      newQuantity = stock.stockQuantity - quantityChange;
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot subtract more than available stock',
          availableQuantity: stock.stockQuantity,
          requestedSubtraction: quantityChange
        });
      }
    }
    
    await stock.update({ stockQuantity: newQuantity });
    
    const updatedStock = await Stock.findByPk(id, {
      include: getStockIncludes()
    });
    
    res.status(200).json({
      success: true,
      message: `Stock quantity ${operation.toLowerCase()}ed successfully`,
      data: updatedStock,
      operation: {
        type: operation,
        change: quantityChange,
        previousQuantity: stock.stockQuantity,
        newQuantity: newQuantity
      }
    });
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock quantity',
      error: error.message
    });
  }
};

// ==================== SUMMARY ENDPOINTS ====================

/**
 * Get stock summary by product with role-based filtering
 */
const getStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    if (checkAdminInventoryAccess(userRole, managedInventoryIds, res)) {
      return;
    }
    
    const whereClause = buildInventoryWhereClause(userRole, managedInventoryIds, { product_id: productId });
    
    const stockSummary = await Stock.findAll({
      where: whereClause,
      attributes: getProductSummaryAttributes(),
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ],
      group: getProductSummaryGroup(),
      raw: false
    });

    const processedSummary = stockSummary.map(item => {
      const summary = item.toJSON ? item.toJSON() : item;
      summary.totalIncoming = Number(summary.totalIncoming || 0);
      summary.totalOutgoing = Number(summary.totalOutgoing || 0);
      summary.totalAvailableQuantity = Number(summary.totalAvailableQuantity || 0);
      summary.transactionCount = Number(summary.transactionCount || 0);
      
      // Verify calculation
      const calculatedAvailable = summary.totalIncoming - summary.totalOutgoing;
      summary.totalAvailableQuantity = calculatedAvailable;
      
      return summary;
    });
    
    res.status(200).json({
      success: true,
      message: `Stock summary for product '${product.productName}' retrieved successfully`,
      data: {
        product: {
          id: product.id,
          productName: product.productName,
          description: product.description
        },
        summary: processedSummary
      }
    });
  } catch (error) {
    console.error('Error fetching stock summary by product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock summary by product',
      error: error.message
    });
  }
};

/**
 * Get stock summary by inventory with access validation
 */
const getStockSummaryByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    if (userRole === 'admin') {
      const hasAccess = await validateInventoryAccess(userId, userRole, inventoryId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to view this inventory summary.'
        });
      }
    }
    
    const stockSummary = await Stock.findAll({
      where: { inventory_id: inventoryId },
      attributes: getInventorySummaryAttributes(),
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ],
      group: getProductSummaryGroup(),
      raw: false
    });

    const processedSummary = stockSummary.map(item => {
      const summary = item.toJSON ? item.toJSON() : item;
      summary.totalQuantity = Number(summary.totalQuantity || 0);
      summary.productCount = Number(summary.productCount || 0);
      return summary;
    });
    
    res.status(200).json({
      success: true,
      message: `Stock summary for inventory '${inventory.inventoryName}' retrieved successfully`,
      data: {
        inventory: {
          id: inventory.id,
          inventoryName: inventory.inventoryName,
          address: inventory.address,
          contactNumber: inventory.contactNumber
        },
        summary: processedSummary
      }
    });
  } catch (error) {
    console.error('Error fetching stock summary by inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock summary by inventory',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockByProduct,
  getStockByInventory,
  getLowStock,
  getStockSummaryByProduct,
  getStockSummaryByInventory,
  updateStockQuantity
};