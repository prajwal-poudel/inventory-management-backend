const express = require('express');
const router = express.Router();
const {
  getAllManages,
  getManagesById,
  createManages,
  updateManages,
  deleteManages,
  getManagesByUser,
  getManagesByInventory
} = require('../controller/managesController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/manages - Get all manages relationships
router.get('/', authenticateToken, getAllManages);

// GET /api/manages/:id - Get manages relationship by ID
router.get('/:id', authenticateToken, getManagesById);

// GET /api/manages/user/:userId - Get manages relationships by user
router.get('/user/:userId', authenticateToken, getManagesByUser);

// GET /api/manages/inventory/:inventoryId - Get manages relationships by inventory
router.get('/inventory/:inventoryId', authenticateToken, getManagesByInventory);

// Admin only routes
// POST /api/manages - Create new manages relationship (admin only)
router.post('/', authenticateToken, requireAdmin, createManages);

// PUT /api/manages/:id - Update manages relationship (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateManages);

// Super admin only routes
// DELETE /api/manages/:id - Delete manages relationship (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteManages);

module.exports = router;