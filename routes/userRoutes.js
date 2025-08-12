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
router.post('/login', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'User login'
  // #swagger.description = 'Authenticate user and return JWT token'
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'User login credentials',
    required: true,
    schema: { $ref: '#/definitions/UserLogin' }
  } */
  /* #swagger.responses[200] = {
    description: 'Login successful',
    schema: {
      success: true,
      message: 'Login successful',
      data: {
        user: { $ref: '#/definitions/User' },
        token: 'jwt_token_here'
      }
    }
  } */
  /* #swagger.responses[401] = {
    description: 'Invalid credentials',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  loginUser);

// Protected routes (authentication required)
// GET /api/users/verify-token - Verify JWT token
router.get('/verify-token', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Verify JWT token'
  // #swagger.description = 'Verify if the provided JWT token is valid'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Token is valid',
    schema: {
      success: true,
      message: 'Token is valid',
      data: { $ref: '#/definitions/User' }
    }
  } */
  /* #swagger.responses[401] = {
    description: 'Invalid or expired token',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, verifyToken);

// PUT /api/users/:id/change-password - Change password (user can change own password or admin can change any)
router.put('/:id/change-password',
  // #swagger.tags = ['Users']
  authenticateToken, requireOwnershipOrAdmin, changePassword);

// Admin only routes
// GET /api/users - Get all users (admin only)
router.get('/', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all users'
  // #swagger.description = 'Retrieve all users (admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Users retrieved successfully',
    schema: {
      success: true,
      message: 'Users retrieved successfully',
      data: [{ $ref: '#/definitions/User' }]
    }
  } */
  /* #swagger.responses[403] = {
    description: 'Access denied - Admin role required',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, requireAdmin, getAllUsers);

// GET /api/users/role/:role - Get users by role (admin only)
router.get('/role/:role',
// #swagger.tags = ['Users']  
  authenticateToken, requireAdmin, getUsersByRole);

// POST /api/users - Create new user (admin only)
router.post('/', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create new user'
  // #swagger.description = 'Create a new user (admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'User data',
    required: true,
    schema: { $ref: '#/definitions/UserCreate' }
  } */
  /* #swagger.responses[201] = {
    description: 'User created successfully',
    schema: {
      success: true,
      message: 'User created successfully',
      data: { $ref: '#/definitions/User' }
    }
  } */
  /* #swagger.responses[403] = {
    description: 'Access denied - Admin role required',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  authenticateToken, requireAdmin, createUser);

// User can view own profile, admin can view any
// GET /api/users/:id - Get user by ID
router.get('/:id',
  // #swagger.tags = ['Users']
  authenticateToken, requireOwnershipOrAdmin, getUserById);

// User can update own profile, admin can update any
// PUT /api/users/:id - Update user
router.put('/:id',
  // #swagger.tags = ['Users']
  authenticateToken, requireOwnershipOrAdmin, updateUser);

// Super admin only routes
// DELETE /api/users/:id - Delete user (super admin only)
router.delete('/:id',
  // #swagger.tags = ['Users']
  authenticateToken, requireSuperAdmin, deleteUser);

module.exports = router;