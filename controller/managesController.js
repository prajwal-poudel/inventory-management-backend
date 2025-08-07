const { Manages, User, Inventory } = require('../models');

// Get all manages relationships
const getAllManages = async (req, res) => {
  try {
    const manages = await Manages.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
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
      message: 'Manages relationships retrieved successfully',
      data: manages
    });
  } catch (error) {
    console.error('Error fetching manages relationships:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manages relationships',
      error: error.message
    });
  }
};

// Get manages relationship by ID
const getManagesById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const manages = await Manages.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'inventoryName', 'address', 'contactNumber']
        }
      ]
    });
    
    if (!manages) {
      return res.status(404).json({
        success: false,
        message: 'Manages relationship not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Manages relationship retrieved successfully',
      data: manages
    });
  } catch (error) {
    console.error('Error fetching manages relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manages relationship',
      error: error.message
    });
  }
};

// Create new manages relationship
const createManages = async (req, res) => {
  try {
    const { user_id, inventory_id } = req.body;
    
    // Validate required fields
    if (!user_id || !inventory_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and inventory ID are required'
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    
    // Check if relationship already exists
    const existingManages = await Manages.findOne({ 
      where: { user_id, inventory_id } 
    });
    if (existingManages) {
      return res.status(409).json({
        success: false,
        message: 'This user already manages this inventory'
      });
    }
    
    // Create manages relationship
    const newManages = await Manages.create({
      user_id,
      inventory_id
    });
    
    // Fetch the created relationship with associations
    const managesWithAssociations = await Manages.findByPk(newManages.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
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
      message: 'Manages relationship created successfully',
      data: managesWithAssociations
    });
  } catch (error) {
    console.error('Error creating manages relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating manages relationship',
      error: error.message
    });
  }
};

// Update manages relationship
const updateManages = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, inventory_id } = req.body;
    
    // Check if manages relationship exists
    const manages = await Manages.findByPk(id);
    if (!manages) {
      return res.status(404).json({
        success: false,
        message: 'Manages relationship not found'
      });
    }
    
    // Check if user exists (if user_id is provided)
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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
    
    // Check if updated relationship would create a duplicate
    if (user_id || inventory_id) {
      const checkUserId = user_id || manages.user_id;
      const checkInventoryId = inventory_id || manages.inventory_id;
      
      const existingManages = await Manages.findOne({ 
        where: { 
          user_id: checkUserId, 
          inventory_id: checkInventoryId,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingManages) {
        return res.status(409).json({
          success: false,
          message: 'This user already manages this inventory'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (user_id) updateData.user_id = user_id;
    if (inventory_id) updateData.inventory_id = inventory_id;
    
    // Update manages relationship
    await manages.update(updateData);
    
    // Return updated relationship with associations
    const updatedManages = await Manages.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
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
      message: 'Manages relationship updated successfully',
      data: updatedManages
    });
  } catch (error) {
    console.error('Error updating manages relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating manages relationship',
      error: error.message
    });
  }
};

// Delete manages relationship
const deleteManages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if manages relationship exists
    const manages = await Manages.findByPk(id);
    if (!manages) {
      return res.status(404).json({
        success: false,
        message: 'Manages relationship not found'
      });
    }
    
    // Delete manages relationship
    await manages.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Manages relationship deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting manages relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting manages relationship',
      error: error.message
    });
  }
};

// Get manages relationships by user
const getManagesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const manages = await Manages.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
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
      message: `Inventories managed by '${user.fullname}' retrieved successfully`,
      data: manages
    });
  } catch (error) {
    console.error('Error fetching manages by user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manages by user',
      error: error.message
    });
  }
};

// Get manages relationships by inventory
const getManagesByInventory = async (req, res) => {
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
    
    const manages = await Manages.findAll({
      where: { inventory_id: inventoryId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
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
      message: `Users managing '${inventory.inventoryName}' retrieved successfully`,
      data: manages
    });
  } catch (error) {
    console.error('Error fetching manages by inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manages by inventory',
      error: error.message
    });
  }
};

module.exports = {
  getAllManages,
  getManagesById,
  createManages,
  updateManages,
  deleteManages,
  getManagesByUser,
  getManagesByInventory
};