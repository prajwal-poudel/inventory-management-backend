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
router.get('/', authenticateToken, getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', authenticateToken, getProductById);

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', authenticateToken, getProductsByCategory);

// Admin only routes
// POST /api/products - Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateProduct);

// Super admin only routes
// DELETE /api/products/:id - Delete product (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteProduct);

module.exports = router;