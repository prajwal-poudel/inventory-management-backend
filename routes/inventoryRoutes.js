const express = require('express');
const router = express.Router();
const {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories,
  getInventoryStats
} = require('../controller/inventoryController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/inventories - Get all inventories
router.get('/',
  // #swagger.tags = ['Inventory']
  authenticateToken, getAllInventories);

// GET /api/inventories/search - Search inventories by name or address
router.get('/search',
  // #swagger.tags = ['Inventory']
  authenticateToken, searchInventories);

// GET /api/inventories/:id - Get inventory by ID
router.get('/:id',
  // #swagger.tags = ['Inventory']
  authenticateToken, getInventoryById);

// GET /api/inventories/:id/stats - Get inventory statistics
router.get('/:id/stats',
  // #swagger.tags = ['Inventory']
  authenticateToken, getInventoryStats);

// Admin only routes
// POST /api/inventories - Create new inventory (admin only)
router.post('/',
  // #swagger.tags = ['Inventory']
  authenticateToken, requireAdmin, createInventory);

// PUT /api/inventories/:id - Update inventory (admin only)
router.put('/:id',
  // #swagger.tags = ['Inventory']
  authenticateToken, requireAdmin, updateInventory);

// Super admin only routes
// DELETE /api/inventories/:id - Delete inventory (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Inventory']
  authenticateToken, requireSuperAdmin, deleteInventory);

module.exports = router;