const { Stock, Product, Inventory, ProductUnits, Unit } = require('../models');
const { Op, fn, col, where } = require('sequelize');

// Helper function to get standard includes for stock queries
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
  }
];

// Slim includes for aggregate queries to avoid hasMany join multiplication
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

// Get all stock records
const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      attributes: ['product_id', 'inventory_id', 'unit_id', [fn('SUM', col('stockQuantity')), 'stockQuantity']],
      include: getAggregatedIncludes(),
      group: ['Stock.product_id', 'Stock.inventory_id', 'Stock.unit_id', 'product.id', 'inventory.id', 'unit.id'],
      order: [[fn('SUM', col('stockQuantity')), 'DESC']]
    });

    // If the DB returns plain objects, normalize stockQuantity number type
    const aggregated = stock.map(r => {
      const row = r.toJSON ? r.toJSON() : r;
      row.stockQuantity = Number(row.stockQuantity);
      return row;
    });
    
    res.status(200).json({
      success: true,
      message: 'Stock records retrieved successfully',
      data: aggregated
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

// Get stock record by ID
const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stock = await Stock.findByPk(id, {
      include: getStockIncludes()
    });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
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

// Create new stock record
const createStock = async (req, res) => {
  try {
    const { stockQuantity, unit_id, product_id, inventory_id, method } = req.body;
    
    // Validate required fields
    if (stockQuantity === undefined || !unit_id || !product_id || !inventory_id) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity, unit ID, product ID, and inventory ID are required'
      });
    }
    
    // Validate stock quantity is non-negative
    if (stockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative'
      });
    }
    
    // Check if unit exists
    const unit = await Unit.findByPk(unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventory_id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // No duplicate check: allow multiple rows for same product/inventory/unit

    // Create stock record
    const newStock = await Stock.create({
      stockQuantity,
      unit_id,
      product_id,
      inventory_id,
      method: method || 'supplier'
    });
    
    // Fetch the created stock record with associations
    const stockWithAssociations = await Stock.findByPk(newStock.id, {
      include: getStockIncludes()
    });
    
    res.status(201).json({
      success: true,
      message: 'Stock record created successfully',
      data: stockWithAssociations
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

// Update stock record
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, unit_id, product_id, inventory_id, method } = req.body;
    
    // Check if stock record exists
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    // Validate stock quantity is non-negative (if provided)
    if (stockQuantity !== undefined && stockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative'
      });
    }
    
    // Check if unit exists (if unit_id is provided)
    if (unit_id) {
      const unit = await Unit.findByPk(unit_id);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Unit not found'
        });
      }
    }
    
    // Check if product exists (if product_id is provided)
    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    }
    
    // Check if inventory exists (if inventory_id is provided)
    if (inventory_id) {
      const inventory = await Inventory.findByPk(inventory_id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory not found'
        });
      }
    }
    
    // No duplicate checks on update: duplicates are allowed

    // Prepare update data
    const updateData = {};
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (unit_id) updateData.unit_id = unit_id;
    if (product_id) updateData.product_id = product_id;
    if (inventory_id) updateData.inventory_id = inventory_id;
    if (method) updateData.method = method;
    
    // Update stock record
    await stock.update(updateData);
    
    // Return updated stock record with associations
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

// Delete stock record
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if stock record exists
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    // Delete stock record
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

// Get stock by product
const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const stock = await Stock.findAll({
      attributes: ['product_id', 'inventory_id', 'unit_id', [fn('SUM', col('stockQuantity')), 'stockQuantity']],
      where: { product_id: productId },
      include: getAggregatedIncludes(),
      group: ['Stock.product_id', 'Stock.inventory_id', 'Stock.unit_id', 'product.id', 'inventory.id', 'unit.id'],
      order: [[fn('SUM', col('stockQuantity')), 'DESC']]
    });

    const aggregated = stock.map(r => {
      const row = r.toJSON ? r.toJSON() : r;
      row.stockQuantity = Number(row.stockQuantity);
      return row;
    });
    
    res.status(200).json({
      success: true,
      message: `Stock records for product '${product.productName}' retrieved successfully`,
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

// Get stock by inventory
const getStockByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    const stock = await Stock.findAll({
      attributes: ['product_id', 'inventory_id', 'unit_id', [fn('SUM', col('stockQuantity')), 'stockQuantity']],
      where: { inventory_id: inventoryId },
      include: getStockIncludes(),
      group: ['Stock.product_id', 'Stock.inventory_id', 'Stock.unit_id', 'product.id', 'product->productUnits.id', 'product->productUnits->unit.id', 'inventory.id', 'unit.id'],
      order: [[fn('SUM', col('stockQuantity')), 'DESC']]
    });

    const aggregated = stock.map(r => {
      const row = r.toJSON ? r.toJSON() : r;
      row.stockQuantity = Number(row.stockQuantity);
      return row;
    });
    
    res.status(200).json({
      success: true,
      message: `Stock records for inventory '${inventory.inventoryName}' retrieved successfully`,
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

// Get low stock items (below threshold)
const getLowStock = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const th = parseFloat(threshold);
    
    const lowStock = await Stock.findAll({
      attributes: ['product_id', 'inventory_id', 'unit_id', [fn('SUM', col('stockQuantity')), 'stockQuantity']],
      include: getStockIncludes(),
      group: ['Stock.product_id', 'Stock.inventory_id', 'Stock.unit_id', 'product.id', 'product->productUnits.id', 'product->productUnits->unit.id', 'inventory.id', 'unit.id'],
      having: where(fn('SUM', col('stockQuantity')), Op.lt, th),
      order: [[fn('SUM', col('stockQuantity')), 'ASC'], [{ model: Unit, as: 'unit' }, 'name', 'ASC']]
    });

    const aggregated = lowStock.map(r => {
      const row = r.toJSON ? r.toJSON() : r;
      row.stockQuantity = Number(row.stockQuantity);
      return row;
    });
    
    res.status(200).json({
      success: true,
      message: 'Low stock items retrieved successfully',
      data: lowStock,
      threshold: parseFloat(threshold)
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

// Get stock summary by product (aggregated across all inventories)
const getStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const stockSummary = await Stock.findAll({
      where: { product_id: productId },
      attributes: [
        'unit_id',
        [require('sequelize').fn('SUM', require('sequelize').col('stockQuantity')), 'totalQuantity'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Stock.id')), 'inventoryCount']
      ],
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ],
      group: ['unit_id', 'unit.id', 'unit.name'],
      raw: false
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
        summary: stockSummary
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

// Get stock summary by inventory (aggregated across all products)
const getStockSummaryByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    const stockSummary = await Stock.findAll({
      where: { inventory_id: inventoryId },
      attributes: [
        'unit_id',
        [require('sequelize').fn('SUM', require('sequelize').col('stockQuantity')), 'totalQuantity'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Stock.id')), 'productCount']
      ],
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ],
      group: ['unit_id', 'unit.id', 'unit.name'],
      raw: false
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
        summary: stockSummary
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

// Update stock quantity (add or subtract)
const updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, operation } = req.body;
    
    // Validate required fields
    if (quantityChange === undefined || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity change and operation are required'
      });
    }
    
    // Validate operation
    if (!['ADD', 'SUBTRACT'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either ADD or SUBTRACT'
      });
    }
    
    // Validate quantity change is positive
    if (quantityChange <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity change must be positive'
      });
    }
    
    // Check if stock record exists
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    // Calculate new quantity
    let newQuantity;
    if (operation === 'ADD') {
      newQuantity = stock.stockQuantity + quantityChange;
    } else {
      newQuantity = stock.stockQuantity - quantityChange;
      
      // Prevent negative stock
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock quantity. Cannot subtract more than available stock.'
        });
      }
    }
    
    // Update stock quantity
    await stock.update({ stockQuantity: newQuantity });
    
    // Return updated stock record with associations
    const updatedStock = await Stock.findByPk(id, {
      include: getStockIncludes()
    });
    
    res.status(200).json({
      success: true,
      message: `Stock quantity ${operation.toLowerCase()}ed successfully`,
      data: updatedStock,
      operation: {
        type: operation,
        quantityChange: quantityChange,
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