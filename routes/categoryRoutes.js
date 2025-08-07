const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithProductCount
} = require('../controller/categoryController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/categories - Get all categories
router.get('/', authenticateToken, getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', authenticateToken, getCategoryById);

// GET /api/categories/stats/product-count - Get categories with product count
router.get('/stats/product-count', authenticateToken, getCategoriesWithProductCount);

// Admin only routes
// POST /api/categories - Create new category (admin only)
router.post('/', authenticateToken, requireAdmin, createCategory);

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateCategory);

// Super admin only routes
// DELETE /api/categories/:id - Delete category (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteCategory);

module.exports = router;