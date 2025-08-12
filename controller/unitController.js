const { Unit } = require('../models');
const { Op } = require('sequelize');

// Get all units
const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.findAll({
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Units retrieved successfully',
      data: units
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching units',
      error: error.message
    });
  }
};

// Get unit by ID
const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const unit = await Unit.findByPk(id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Unit retrieved successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unit',
      error: error.message
    });
  }
};

// Create new unit
const createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required'
      });
    }
    
    // Check if unit with same name already exists
    const existingUnit = await Unit.findOne({ 
      where: { 
        name: name.toUpperCase() // Store unit names in uppercase for consistency
      } 
    });
    
    if (existingUnit) {
      return res.status(409).json({
        success: false,
        message: 'Unit with this name already exists'
      });
    }
    
    // Create new unit
    const unit = await Unit.create({
      name: name.toUpperCase()
    });
    
    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Unit with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating unit',
      error: error.message
    });
  }
};

// Update unit
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required'
      });
    }
    
    // Check if unit exists
    const unit = await Unit.findByPk(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Check if another unit with same name already exists
    const existingUnit = await Unit.findOne({ 
      where: { 
        name: name.toUpperCase(),
        id: { [Op.ne]: id }
      } 
    });
    
    if (existingUnit) {
      return res.status(409).json({
        success: false,
        message: 'Unit with this name already exists'
      });
    }
    
    // Update unit
    await unit.update({
      name: name.toUpperCase()
    });
    
    res.status(200).json({
      success: true,
      message: 'Unit updated successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Unit with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating unit',
      error: error.message
    });
  }
};

// Delete unit
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if unit exists
    const unit = await Unit.findByPk(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Note: You might want to add a check here to prevent deletion of units
    // that are being used in other tables (like Stock table)
    // For example:
    // const stockCount = await Stock.count({ where: { unit: unit.name } });
    // if (stockCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete unit that is being used in stock records'
    //   });
    // }
    
    await unit.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting unit',
      error: error.message
    });
  }
};

// Search units by name
const searchUnits = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Search name parameter is required'
      });
    }
    
    const units = await Unit.findAll({
      where: {
        name: {
          [Op.like]: `%${name.toUpperCase()}%`
        }
      },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Found ${units.length} unit(s) matching search criteria`,
      data: units
    });
  } catch (error) {
    console.error('Error searching units:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching units',
      error: error.message
    });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  searchUnits
};