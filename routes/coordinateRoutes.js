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
router.get('/',
  // #swagger.tags = ['Coordinates']
  authenticateToken, getAllCoordinates);

// GET /api/coordinates/radius - Get coordinates within radius
router.get('/radius',
  // #swagger.tags = ['Coordinates']
  authenticateToken, getCoordinatesInRadius);

// GET /api/coordinates/:id - Get coordinate by ID
router.get('/:id',
  // #swagger.tags = ['Coordinates']
  authenticateToken, getCoordinateById);

// GET /api/coordinates/customer/:customerId - Get coordinate by customer
router.get('/customer/:customerId',
  // #swagger.tags = ['Coordinates']
  authenticateToken, getCoordinateByCustomer);

// Admin only routes
// POST /api/coordinates - Create new coordinate (admin only)
router.post('/',
  // #swagger.tags = ['Coordinates']
  authenticateToken, requireAdmin, createCoordinate);

// PUT /api/coordinates/:id - Update coordinate (admin only)
router.put('/:id',
  // #swagger.tags = ['Coordinates']
  authenticateToken, requireAdmin, updateCoordinate);

// Super admin only routes
// DELETE /api/coordinates/:id - Delete coordinate (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Coordinates']
  authenticateToken, requireSuperAdmin, deleteCoordinate);

module.exports = router;