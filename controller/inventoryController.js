const { Inventory, Manages, User, Stock, Product, Unit } = require('../models');

// Get all inventories
const getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.findAll({
      include: [
        {
          model: Manages,
          as: 'managers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email', 'role']
            }
          ]
        },
        {
          model: Stock,
          as: 'stock',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'productName', 'description']
            },
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Inventories retrieved successfully',
      data: inventories
    });
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventories',
      error: error.message
    });
  }
};

// Get inventory by ID
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventory = await Inventory.findByPk(id, {
      include: [
        {
          model: Manages,
          as: 'managers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email', 'role']
            }
          ]
        },
        {
          model: Stock,
          as: 'stock',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'productName', 'description']
            }
          ]
        }
      ]
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory retrieved successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
};

// Create new inventory
const createInventory = async (req, res) => {
  try {
    const { inventoryName, address, contactNumber } = req.body;
    
    // Validate required fields
    if (!inventoryName || !address || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Inventory name, address, and contact number are required'
      });
    }
    
    // Check if inventory with same name already exists
    const existingInventory = await Inventory.findOne({ where: { inventoryName } });
    if (existingInventory) {
      return res.status(409).json({
        success: false,
        message: 'Inventory with this name already exists'
      });
    }
    
    // Create inventory
    const newInventory = await Inventory.create({
      inventoryName,
      address,
      contactNumber
    });
    
    res.status(201).json({
      success: true,
      message: 'Inventory created successfully',
      data: newInventory
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inventory',
      error: error.message
    });
  }
};

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { inventoryName, address, contactNumber } = req.body;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Check if name is being changed and if it already exists
    if (inventoryName && inventoryName !== inventory.inventoryName) {
      const existingInventory = await Inventory.findOne({ where: { inventoryName } });
      if (existingInventory) {
        return res.status(409).json({
          success: false,
          message: 'Inventory with this name already exists'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (inventoryName) updateData.inventoryName = inventoryName;
    if (address) updateData.address = address;
    if (contactNumber) updateData.contactNumber = contactNumber;
    
    // Update inventory
    await inventory.update(updateData);
    
    // Return updated inventory with associations
    const updatedInventory = await Inventory.findByPk(id, {
      include: [
        {
          model: Manages,
          as: 'managers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email', 'role']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedInventory
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};

// Delete inventory
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Check if inventory has stock records
    const stockCount = await Stock.count({ where: { inventory_id: id } });
    if (stockCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete inventory that has stock records. Please delete stock records first.'
      });
    }
    
    // Check if inventory has managers
    const managesCount = await Manages.count({ where: { inventory_id: id } });
    if (managesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete inventory that has managers. Please remove managers first.'
      });
    }
    
    // Delete inventory
    await inventory.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Inventory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory',
      error: error.message
    });
  }
};

// Search inventories by name or address
const searchInventories = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const inventories = await Inventory.findAll({
      where: {
        [require('sequelize').Op.or]: [
          {
            inventoryName: {
              [require('sequelize').Op.like]: `%${query}%`
            }
          },
          {
            address: {
              [require('sequelize').Op.like]: `%${query}%`
            }
          }
        ]
      },
      include: [
        {
          model: Manages,
          as: 'managers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email', 'role']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Inventory search completed successfully',
      data: inventories
    });
  } catch (error) {
    console.error('Error searching inventories:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching inventories',
      error: error.message
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Get stock statistics grouped by unit
    const stockStatsByUnit = await Stock.findAll({
      where: { 
        inventory_id: id
      },
      attributes: [
        'unit_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Stock.id')), 'totalProducts'],
        [require('sequelize').fn('SUM', require('sequelize').col('stockQuantity')), 'totalStock']
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
    
    // Get total unique products count
    const totalProducts = await Stock.count({
      where: { inventory_id: id },
      distinct: true,
      col: 'product_id'
    });
    
    // Get manager count
    const managerCount = await Manages.count({ where: { inventory_id: id } });
    
    // Get low stock count (using default threshold of 10)
    const lowStockCount = await Stock.count({
      where: {
        inventory_id: id,
        stockQuantity: { [require('sequelize').Op.lt]: 10 }
      }
    });
    
    const stats = {
      inventory: {
        id: inventory.id,
        inventoryName: inventory.inventoryName,
        address: inventory.address,
        contactNumber: inventory.contactNumber
      },
      totalProducts: totalProducts || 0,
      stockByUnit: stockStatsByUnit.map(stat => ({
        unit: stat.unit,
        totalProducts: parseInt(stat.dataValues.totalProducts) || 0,
        totalStock: parseFloat(stat.dataValues.totalStock) || 0
      })),
      managerCount: managerCount,
      lowStockCount: lowStockCount
    };
    
    res.status(200).json({
      success: true,
      message: 'Inventory statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories,
  getInventoryStats
};