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
  getLowStock,
  getStockMovementsByOrder,
  getAllOrderStockMovements
} = require('../controller/stockController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/stock - Get all stock records
router.get('/', 
  // #swagger.tags = ['Stock']
  // #swagger.summary = 'Get all stock records'
  // #swagger.description = 'Retrieve all stock records with product and inventory details'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Stock records retrieved successfully',
    schema: {
      success: true,
      message: 'Stock records retrieved successfully',
      data: [{ $ref: '#/definitions/Stock' }]
    }
  } */
  authenticateToken, getAllStock);

// GET /api/stock/low - Get low stock items
router.get('/low', 
  // #swagger.tags = ['Stock']
  // #swagger.summary = 'Get low stock items'
  // #swagger.description = 'Retrieve items with stock quantity below threshold'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['threshold'] = {
    in: 'query',
    description: 'Stock threshold (default: 10)',
    required: false,
    type: 'integer'
  } */
  /* #swagger.responses[200] = {
    description: 'Low stock items retrieved successfully',
    schema: {
      success: true,
      message: 'Low stock items retrieved successfully',
      data: [{ $ref: '#/definitions/Stock' }]
    }
  } */
  authenticateToken, getLowStock);

// GET /api/stock/:id - Get stock record by ID
router.get('/:id',
  // #swagger.tags = ['Stock']
  authenticateToken, getStockById);

// GET /api/stock/product/:productId - Get stock by product
router.get('/product/:productId',
  // #swagger.tags = ['Stock']
  authenticateToken, getStockByProduct);

// GET /api/stock/inventory/:inventoryId - Get stock by inventory
router.get('/inventory/:inventoryId',
  // #swagger.tags = ['Stock']
  authenticateToken, getStockByInventory);

// Admin only routes
// POST /api/stock - Create new stock record (admin only)
router.post('/',
  // #swagger.tags = ['Stock']
  authenticateToken, requireAdmin, createStock);

// PUT /api/stock/:id - Update stock record (admin only)
router.put('/:id',
  // #swagger.tags = ['Stock']
  authenticateToken, requireAdmin, updateStock);

// Super admin only routes
// DELETE /api/stock/:id - Delete stock record (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Stock']
  authenticateToken, requireSuperAdmin, deleteStock);

module.exports = router;