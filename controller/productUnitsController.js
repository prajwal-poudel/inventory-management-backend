const { ProductUnits, Product, Unit } = require('../models');
const { Op } = require('sequelize');

// Get all product units
const getAllProductUnits = async (req, res) => {
  try {
    const productUnits = await ProductUnits.findAll({
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
      ],
      order: [['product_id', 'ASC'], ['unit_id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Product units retrieved successfully',
      data: productUnits
    });
  } catch (error) {
    console.error('Error fetching product units:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product units',
      error: error.message
    });
  }
};

// Get product units by product ID
const getProductUnitsByProduct = async (req, res) => {
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
    
    const productUnits = await ProductUnits.findAll({
      where: { product_id: productId },
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
      ],
      order: [['unit_id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Product units for '${product.productName}' retrieved successfully`,
      data: productUnits
    });
  } catch (error) {
    console.error('Error fetching product units by product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product units by product',
      error: error.message
    });
  }
};

// Get product units by unit ID
const getProductUnitsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    
    // Check if unit exists
    const unit = await Unit.findByPk(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    const productUnits = await ProductUnits.findAll({
      where: { unit_id: unitId },
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
      ],
      order: [['product_id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Product units for unit '${unit.name}' retrieved successfully`,
      data: productUnits
    });
  } catch (error) {
    console.error('Error fetching product units by unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product units by unit',
      error: error.message
    });
  }
};

// Get specific product unit by product and unit
const getProductUnit = async (req, res) => {
  try {
    const { productId, unitId } = req.params;
    
    const productUnit = await ProductUnits.findOne({
      where: { 
        product_id: productId,
        unit_id: unitId
      },
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
    });
    
    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Product unit combination not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product unit retrieved successfully',
      data: productUnit
    });
  } catch (error) {
    console.error('Error fetching product unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product unit',
      error: error.message
    });
  }
};

// Create new product unit
const createProductUnit = async (req, res) => {
  try {
    const { product_id, unit_id, rate } = req.body;
    
    // Validate required fields
    if (!product_id || !unit_id || rate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Unit ID, and rate are required'
      });
    }
    
    // Validate rate is positive
    if (rate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Rate must be a positive number'
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
    
    // Check if unit exists
    const unit = await Unit.findByPk(unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Check if product-unit combination already exists
    const existingProductUnit = await ProductUnits.findOne({
      where: { product_id, unit_id }
    });
    
    if (existingProductUnit) {
      return res.status(409).json({
        success: false,
        message: 'Product unit combination already exists'
      });
    }
    
    // Create new product unit
    const productUnit = await ProductUnits.create({
      product_id,
      unit_id,
      rate
    });
    
    // Return created product unit with associations
    const createdProductUnit = await ProductUnits.findByPk(productUnit.id, {
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
    });
    
    res.status(201).json({
      success: true,
      message: 'Product unit created successfully',
      data: createdProductUnit
    });
  } catch (error) {
    console.error('Error creating product unit:', error);
    
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
        message: 'Product unit combination already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product unit',
      error: error.message
    });
  }
};

// Update product unit
const updateProductUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate } = req.body;
    
    // Validate required fields
    if (rate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Rate is required'
      });
    }
    
    // Validate rate is positive
    if (rate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Rate must be a positive number'
      });
    }
    
    // Check if product unit exists
    const productUnit = await ProductUnits.findByPk(id);
    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Product unit not found'
      });
    }
    
    // Update product unit
    await productUnit.update({ rate });
    
    // Return updated product unit with associations
    const updatedProductUnit = await ProductUnits.findByPk(id, {
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
    });
    
    res.status(200).json({
      success: true,
      message: 'Product unit updated successfully',
      data: updatedProductUnit
    });
  } catch (error) {
    console.error('Error updating product unit:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: 'Error updating product unit',
      error: error.message
    });
  }
};

// Delete product unit
const deleteProductUnit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product unit exists
    const productUnit = await ProductUnits.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Product unit not found'
      });
    }
    
    await productUnit.destroy();
    
    res.status(200).json({
      success: true,
      message: `Product unit for '${productUnit.product.productName}' in '${productUnit.unit.name}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product unit',
      error: error.message
    });
  }
};

// Bulk create product units for a product
const createBulkProductUnits = async (req, res) => {
  try {
    const { product_id, units } = req.body;
    
    // Validate required fields
    if (!product_id || !units || !Array.isArray(units) || units.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and units array are required'
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
    
    // Validate units data
    for (const unit of units) {
      if (!unit.unit_id || unit.rate === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Each unit must have unit_id and rate'
        });
      }
      
      if (unit.rate < 0) {
        return res.status(400).json({
          success: false,
          message: 'All rates must be positive numbers'
        });
      }
    }
    
    // Check if all units exist
    const unitIds = units.map(u => u.unit_id);
    const existingUnits = await Unit.findAll({
      where: { id: { [Op.in]: unitIds } }
    });
    
    if (existingUnits.length !== unitIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more units not found'
      });
    }
    
    // Prepare data for bulk insert
    const productUnitsData = units.map(unit => ({
      product_id,
      unit_id: unit.unit_id,
      rate: unit.rate
    }));
    
    // Create product units
    const createdProductUnits = await ProductUnits.bulkCreate(productUnitsData, {
      ignoreDuplicates: true,
      returning: true
    });
    
    // Get created product units with associations
    const productUnitsWithAssociations = await ProductUnits.findAll({
      where: { 
        product_id,
        unit_id: { [Op.in]: unitIds }
      },
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
    });
    
    res.status(201).json({
      success: true,
      message: `${createdProductUnits.length} product units created successfully`,
      data: productUnitsWithAssociations
    });
  } catch (error) {
    console.error('Error creating bulk product units:', error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'One or more product unit combinations already exist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating bulk product units',
      error: error.message
    });
  }
};

module.exports = {
  getAllProductUnits,
  getProductUnitsByProduct,
  getProductUnitsByUnit,
  getProductUnit,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
  createBulkProductUnits
};