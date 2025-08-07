const { Stock, Product, Inventory } = require('../models');

// Get all stock records
const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Stock records retrieved successfully',
      data: stock
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
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori', 'description']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ]
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
    const { stockKg, stockBori, product_id, inventory_id } = req.body;
    
    // Validate required fields
    if (stockKg === undefined || stockBori === undefined || !product_id || !inventory_id) {
      return res.status(400).json({
        success: false,
        message: 'Stock kg, stock bori, product ID, and inventory ID are required'
      });
    }
    
    // Validate stock values are non-negative
    if (stockKg < 0 || stockBori < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock values cannot be negative'
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
    
    // Check if stock record already exists for this product in this inventory
    const existingStock = await Stock.findOne({ 
      where: { product_id, inventory_id } 
    });
    if (existingStock) {
      return res.status(409).json({
        success: false,
        message: 'Stock record already exists for this product in this inventory'
      });
    }
    
    // Create stock record
    const newStock = await Stock.create({
      stockKg,
      stockBori,
      product_id,
      inventory_id
    });
    
    // Fetch the created stock record with associations
    const stockWithAssociations = await Stock.findByPk(newStock.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ]
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
    const { stockKg, stockBori, product_id, inventory_id } = req.body;
    
    // Check if stock record exists
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }
    
    // Validate stock values are non-negative (if provided)
    if ((stockKg !== undefined && stockKg < 0) || (stockBori !== undefined && stockBori < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Stock values cannot be negative'
      });
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
    
    // Check if updated record would create a duplicate
    if (product_id || inventory_id) {
      const checkProductId = product_id || stock.product_id;
      const checkInventoryId = inventory_id || stock.inventory_id;
      
      const existingStock = await Stock.findOne({ 
        where: { 
          product_id: checkProductId, 
          inventory_id: checkInventoryId,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingStock) {
        return res.status(409).json({
          success: false,
          message: 'Stock record already exists for this product in this inventory'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (stockKg !== undefined) updateData.stockKg = stockKg;
    if (stockBori !== undefined) updateData.stockBori = stockBori;
    if (product_id) updateData.product_id = product_id;
    if (inventory_id) updateData.inventory_id = inventory_id;
    
    // Update stock record
    await stock.update(updateData);
    
    // Return updated stock record with associations
    const updatedStock = await Stock.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ]
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
      where: { product_id: productId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Stock records for product '${product.productName}' retrieved successfully`,
      data: stock
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
      where: { inventory_id: inventoryId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Stock records for inventory '${inventory.inventoryName}' retrieved successfully`,
      data: stock
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
    const { kgThreshold = 10, boriThreshold = 5 } = req.query;
    
    const lowStock = await Stock.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { stockKg: { [require('sequelize').Op.lt]: parseFloat(kgThreshold) } },
          { stockBori: { [require('sequelize').Op.lt]: parseFloat(boriThreshold) } }
        ]
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'ratePerKg', 'ratePerBori']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ],
      order: [['stockKg', 'ASC'], ['stockBori', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Low stock items retrieved successfully',
      data: lowStock,
      thresholds: {
        kgThreshold: parseFloat(kgThreshold),
        boriThreshold: parseFloat(boriThreshold)
      }
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

module.exports = {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockByProduct,
  getStockByInventory,
  getLowStock
};