const express = require('express');
const router = express.Router();
const {
  getAllCoordinates,
  getCoordinateById,
  createCoordinate,
  updateCoordinate,
  deleteCoordinate,
  getCoordinateByCustomer,
  getCoordinatesInRadius
} = require('../controller/coordinateController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/coordinates - Get all coordinates
router.get('/', authenticateToken, getAllCoordinates);

// GET /api/coordinates/radius - Get coordinates within radius
router.get('/radius', authenticateToken, getCoordinatesInRadius);

// GET /api/coordinates/:id - Get coordinate by ID
router.get('/:id', authenticateToken, getCoordinateById);

// GET /api/coordinates/customer/:customerId - Get coordinate by customer
router.get('/customer/:customerId', authenticateToken, getCoordinateByCustomer);

// Admin only routes
// POST /api/coordinates - Create new coordinate (admin only)
router.post('/', authenticateToken, requireAdmin, createCoordinate);

// PUT /api/coordinates/:id - Update coordinate (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateCoordinate);

// Super admin only routes
// DELETE /api/coordinates/:id - Delete coordinate (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteCoordinate);

module.exports = router;