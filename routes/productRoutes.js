const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controller/productController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/products - Get all products
router.get('/', 
  // #swagger.tags = ['Products']
  // #swagger.summary = 'Get all products'
  // #swagger.description = 'Retrieve all products with category and unit information'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Products retrieved successfully',
    schema: {
      success: true,
      message: 'Products retrieved successfully',
      data: [{ $ref: '#/definitions/Product' }]
    }
  } */
  authenticateToken, getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', 
  // #swagger.tags = ['Products']
  // #swagger.summary = 'Get product by ID'
  // #swagger.description = 'Retrieve a specific product by its ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    description: 'Product ID',
    required: true,
    type: 'integer'
  } */
  /* #swagger.responses[200] = {
    description: 'Product retrieved successfully',
    schema: {
      success: true,
      message: 'Product retrieved successfully',
      data: { $ref: '#/definitions/Product' }
    }
  } */
  /* #swagger.responses[404] = {
    description: 'Product not found',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, getProductById);

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', 
  // #swagger.tags = ['Products']
  // #swagger.summary = 'Get products by category'
  // #swagger.description = 'Retrieve all products belonging to a specific category'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['categoryId'] = {
    in: 'path',
    description: 'Category ID',
    required: true,
    type: 'integer'
  } */
  /* #swagger.responses[200] = {
    description: 'Products retrieved successfully',
    schema: {
      success: true,
      message: 'Products retrieved successfully',
      data: [{ $ref: '#/definitions/Product' }]
    }
  } */
  authenticateToken, getProductsByCategory);

// Admin only routes
// POST /api/products - Create new product (admin only)
router.post('/',
  // #swagger.tags = ['Products']
  authenticateToken, requireSuperAdmin, createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id',
  // #swagger.tags = ['Products']
  authenticateToken, requireSuperAdmin, updateProduct);

// Super admin only routes
// DELETE /api/products/:id - Delete product (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Products']
  authenticateToken, requireSuperAdmin, deleteProduct);

module.exports = router;