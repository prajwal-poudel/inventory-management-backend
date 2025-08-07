const express = require('express');
const router = express.Router();
const {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockByProduct,
  getStockByInventory,
  getLowStock
} = require('../controller/stockController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/stock - Get all stock records
router.get('/', authenticateToken, getAllStock);

// GET /api/stock/low - Get low stock items
router.get('/low', authenticateToken, getLowStock);

// GET /api/stock/:id - Get stock record by ID
router.get('/:id', authenticateToken, getStockById);

// GET /api/stock/product/:productId - Get stock by product
router.get('/product/:productId', authenticateToken, getStockByProduct);

// GET /api/stock/inventory/:inventoryId - Get stock by inventory
router.get('/inventory/:inventoryId', authenticateToken, getStockByInventory);

// Admin only routes
// POST /api/stock - Create new stock record (admin only)
router.post('/', authenticateToken, requireAdmin, createStock);

// PUT /api/stock/:id - Update stock record (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateStock);

// Super admin only routes
// DELETE /api/stock/:id - Delete stock record (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteStock);

module.exports = router;