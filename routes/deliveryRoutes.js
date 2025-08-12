const express = require('express');
const router = express.Router();
const {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliveriesByDriver,
  getDeliveryByOrder
} = require('../controller/deliveryController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/deliveries - Get all deliveries
router.get('/',
  // #swagger.tags = ['Deliveries']
  authenticateToken, getAllDeliveries);

// GET /api/deliveries/:id - Get delivery by ID
router.get('/:id',
  // #swagger.tags = ['Deliveries']
  authenticateToken, getDeliveryById);

// GET /api/deliveries/driver/:driverId - Get deliveries by driver
router.get('/driver/:driverId',
  // #swagger.tags = ['Deliveries']
  authenticateToken, getDeliveriesByDriver);

// GET /api/deliveries/order/:orderId - Get delivery by order
router.get('/order/:orderId',
  // #swagger.tags = ['Deliveries']
  authenticateToken, getDeliveryByOrder);

// Admin only routes
// POST /api/deliveries - Create new delivery (admin only)
router.post('/',
  // #swagger.tags = ['Deliveries']
  authenticateToken, requireAdmin, createDelivery);

// PUT /api/deliveries/:id - Update delivery (admin only)
router.put('/:id',
  // #swagger.tags = ['Deliveries']
  authenticateToken, requireAdmin, updateDelivery);

// Super admin only routes
// DELETE /api/deliveries/:id - Delete delivery (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Deliveries']
  authenticateToken, requireSuperAdmin, deleteDelivery);

module.exports = router;