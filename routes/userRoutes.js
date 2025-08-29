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
  changePassword,
  forgotPassword,
  resetPassword,
  validateResetToken
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

// POST /api/users/forgot-password - Request password reset
router.post('/forgot-password', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Request password reset'
  // #swagger.description = 'Send password reset email to user'
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'User email for password reset',
    required: true,
    schema: { 
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com'
        }
      },
      required: ['email']
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Password reset email sent (if email exists)',
    schema: {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    }
  } */
  /* #swagger.responses[400] = {
    description: 'Email is required',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  forgotPassword);

// POST /api/users/reset-password - Reset password with token
router.post('/reset-password', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Reset password with token'
  // #swagger.description = 'Reset user password using reset token'
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Reset token and new password',
    required: true,
    schema: { 
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'abc123def456...'
        },
        newPassword: {
          type: 'string',
          minLength: 6,
          example: 'newSecurePassword123'
        }
      },
      required: ['token', 'newPassword']
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Password reset successful',
    schema: {
      success: true,
      message: 'Password has been reset successfully'
    }
  } */
  /* #swagger.responses[400] = {
    description: 'Invalid or expired token, or validation error',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  resetPassword);

// GET /api/users/validate-reset-token/:token - Validate reset token
router.get('/validate-reset-token/:token', 
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Validate password reset token'
  // #swagger.description = 'Check if password reset token is valid and not expired'
  /* #swagger.parameters['token'] = {
    in: 'path',
    description: 'Password reset token',
    required: true,
    type: 'string'
  } */
  /* #swagger.responses[200] = {
    description: 'Token is valid',
    schema: {
      success: true,
      message: 'Reset token is valid',
      data: {
        email: 'user@example.com',
        fullname: 'User Name'
      }
    }
  } */
  /* #swagger.responses[400] = {
    description: 'Invalid or expired token',
    schema: { $ref: '#/definitions/ErrorResponse' }
  } */
  validateResetToken);

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
  authenticateToken, requireSuperAdmin, createUser);

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