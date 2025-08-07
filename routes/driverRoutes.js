const express = require('express');
const router = express.Router();
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  searchDrivers,
  getDriversWithDeliveryCount
} = require('../controller/driverController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/drivers - Get all drivers
router.get('/', authenticateToken, getAllDrivers);

// GET /api/drivers/search - Search drivers by name or phone
router.get('/search', authenticateToken, searchDrivers);

// GET /api/drivers/stats/delivery-count - Get drivers with delivery count
router.get('/stats/delivery-count', authenticateToken, getDriversWithDeliveryCount);

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', authenticateToken, getDriverById);

// Admin only routes
// POST /api/drivers - Create new driver (admin only)
router.post('/', authenticateToken, requireAdmin, createDriver);

// PUT /api/drivers/:id - Update driver (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateDriver);

// Super admin only routes
// DELETE /api/drivers/:id - Delete driver (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteDriver);

module.exports = router;