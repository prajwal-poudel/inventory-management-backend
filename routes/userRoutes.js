const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  loginUser,
  verifyToken,
  changePassword
} = require('../controller/userController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  requireOwnershipOrAdmin
} = require('../middleware/authMiddleware');

// Public routes (no authentication required)
// POST /api/users/login - Login user
router.post('/login', loginUser);

// Protected routes (authentication required)
// GET /api/users/verify-token - Verify JWT token
router.get('/verify-token', authenticateToken, verifyToken);

// PUT /api/users/:id/change-password - Change password (user can change own password or admin can change any)
router.put('/:id/change-password', authenticateToken, requireOwnershipOrAdmin, changePassword);

// Admin only routes
// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, getAllUsers);

// GET /api/users/role/:role - Get users by role (admin only)
router.get('/role/:role', authenticateToken, requireAdmin, getUsersByRole);

// POST /api/users - Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, createUser);

// User can view own profile, admin can view any
// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, getUserById);

// User can update own profile, admin can update any
// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, updateUser);

// Super admin only routes
// DELETE /api/users/:id - Delete user (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteUser);

module.exports = router;