const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} = require('../controller/customerController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// Public routes (authentication required but accessible to all authenticated users)
// GET /api/customers - Get all customers
router.get('/',
  // #swagger.tags = ['Customers']
  authenticateToken, getAllCustomers);

// GET /api/customers/search - Search customers by name or phone
router.get('/search',
  // #swagger.tags = ['Customers']
  authenticateToken, searchCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id',
  // #swagger.tags = ['Customers']
  authenticateToken, getCustomerById);

// Admin only routes
// POST /api/customers - Create new customer (admin only)
router.post('/',
  // #swagger.tags = ['Customers']
  authenticateToken, requireAdmin, createCustomer);

// PUT /api/customers/:id - Update customer (admin only)
router.put('/:id', 
  // #swagger.tags = ['Customers']
  authenticateToken, requireAdmin, updateCustomer);

// Super admin only routes
// DELETE /api/customers/:id - Delete customer (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Customers']
  authenticateToken, requireSuperAdmin, deleteCustomer);

module.exports = router;