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
router.get('/', authenticateToken, getAllCustomers);

// GET /api/customers/search - Search customers by name or phone
router.get('/search', authenticateToken, searchCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', authenticateToken, getCustomerById);

// Admin only routes
// POST /api/customers - Create new customer (admin only)
router.post('/', authenticateToken, requireAdmin, createCustomer);

// PUT /api/customers/:id - Update customer (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateCustomer);

// Super admin only routes
// DELETE /api/customers/:id - Delete customer (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteCustomer);

module.exports = router;