const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStatus,
  getOrdersByInventory,
  updateOrderStatus
} = require('../controller/orderController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Protected routes (authentication required)
// GET /api/orders - Get all orders (admin only)
router.get('/', 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Get all orders'
  // #swagger.description = 'Retrieve all orders with customer, product, inventory, and delivery details (admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Orders retrieved successfully',
    schema: {
      success: true,
      message: 'Orders retrieved successfully',
      data: [{ $ref: '#/definitions/Order' }]
    }
  } */
  /* #swagger.responses[403] = {
    description: 'Access denied - Admin role required',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, requireAdmin, getAllOrders);

// GET /api/orders/:id - Get order by ID (admin only)
router.get('/:id',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, getOrderById);

// POST /api/orders - Create new order (admin only)
router.post('/', 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Create new order'
  // #swagger.description = 'Create a new order with automatic stock deduction and total amount calculation (admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Order data',
    required: true,
    schema: {
      type: 'object',
      required: ['customerId', 'productId', 'inventoryId', 'quantity', 'unit_id'],
      properties: {
        customerId: { type: 'integer', example: 1 },
        productId: { type: 'integer', example: 1 },
        inventoryId: { type: 'integer', example: 1 },
        quantity: { type: 'number', example: 10 },
        unit_id: { type: 'integer', example: 1 },
        status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
        paymentMethod: { type: 'string', enum: ['cash', 'cheque', 'card', 'no'], example: 'cash' },
        orderDate: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  } */
  /* #swagger.responses[201] = {
    description: 'Order created successfully',
    schema: {
      success: true,
      message: 'Order created successfully and stock updated',
      data: {
        order: { $ref: '#/definitions/Order' },
        calculation: {
          rate: 100.00,
          quantity: 10,
          unit: 'KG',
          totalAmount: 1000.00,
          formula: '100 × 10 = 1000'
        },
        stockUpdate: {
          previousStock: 110,
          currentStock: 100,
          quantityUsed: 10,
          unit: 'KG'
        }
      }
    }
  } */
  /* #swagger.responses[400] = {
    description: 'Bad request - Invalid data or insufficient stock',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  /* #swagger.responses[403] = {
    description: 'Access denied - Admin role required',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  /* #swagger.responses[404] = {
    description: 'Customer, Product, or Inventory not found',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, requireAdmin, createOrder);

// PUT /api/orders/:id - Update order (admin only)
router.put('/:id',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, updateOrder);

// DELETE /api/orders/:id - Delete order (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Orders']
  authenticateToken, requireSuperAdmin, deleteOrder);

// GET /api/orders/customer/:customerId - Get orders by customer (admin only)
router.get('/customer/:customerId',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, getOrdersByCustomer);

// GET /api/orders/status/:status - Get orders by status (admin only)
router.get('/status/:status',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, getOrdersByStatus);

// GET /api/orders/inventory/:inventoryId - Get orders by inventory (admin only)
router.get('/inventory/:inventoryId',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, getOrdersByInventory);

// PATCH /api/orders/:id/status - Update order status (admin only)
router.patch('/:id/status',
  // #swagger.tags = ['Orders']
  authenticateToken, requireAdmin, updateOrderStatus);

module.exports = router;