const { Product, Category, Stock, ProductUnits, Unit, Inventory } = require('../models');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'categoryCol']
        },
        {
          model: Stock,
          as: 'stocks',
          attributes: ['id', 'stockQuantity', 'unit_id', 'inventory_id'],
          include: [
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name']
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName']
            }
          ]
        },
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
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'categoryCol']
        },
        {
          model: Stock,
          as: 'stocks',
          attributes: ['id', 'stockQuantity', 'unit_id', 'inventory_id'],
          include: [
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name']
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName']
            }
          ]
        },
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
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { productName, description, category_id, units } = req.body;
    
    // Validate required fields
    if (!productName || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Product name and category ID are required'
      });
    }
    
    // Check if category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Create product
    const newProduct = await Product.create({
      productName,
      description,
      category_id
    });
    
    // If units are provided, create product units
    if (units && Array.isArray(units) && units.length > 0) {
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
        where: { id: { [require('sequelize').Op.in]: unitIds } }
      });
      
      if (existingUnits.length !== unitIds.length) {
        // Delete the created product if units validation fails
        await newProduct.destroy();
        return res.status(404).json({
          success: false,
          message: 'One or more units not found'
        });
      }
      
      // Create product units
      const productUnitsData = units.map(unit => ({
        product_id: newProduct.id,
        unit_id: unit.unit_id,
        rate: unit.rate
      }));
      
      await ProductUnits.bulkCreate(productUnitsData);
    }
    
    // Fetch the created product with associations
    const productWithAssociations = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'categoryCol']
        },
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
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productWithAssociations
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, description, category_id } = req.body;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if category exists (if category_id is provided)
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (productName) updateData.productName = productName;
    if (description !== undefined) updateData.description = description;
    if (category_id) updateData.category_id = category_id;
    
    // Update product
    await product.update(updateData);
    
    // Return updated product with associations
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'categoryCol']
        },
        {
          model: Stock,
          as: 'stocks',
          attributes: ['id', 'stockQuantity', 'unit_id', 'inventory_id'],
          include: [
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name']
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName']
            }
          ]
        },
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
    });
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete product
    await product.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const products = await Product.findAll({
      where: { category_id: categoryId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'categoryCol']
        },
        {
          model: Stock,
          as: 'stocks',
          attributes: ['id', 'stockQuantity', 'unit_id', 'inventory_id'],
          include: [
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name']
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName']
            }
          ]
        },
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
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Products in category '${category.name}' retrieved successfully`,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
};