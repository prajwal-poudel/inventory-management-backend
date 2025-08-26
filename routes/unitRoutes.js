const express = require('express');
const router = express.Router();
const {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  searchUnits
} = require('../controller/unitController');

const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// GET /api/units - Get all units
router.get('/',
  // #swagger.tags = ['Units']
 authenticateToken, getAllUnits);

// GET /api/units/search - Search units by name
router.get('/search',
  // #swagger.tags = ['Units']
authenticateToken,  searchUnits);

// GET /api/units/:id - Get unit by ID
router.get('/:id',
  // #swagger.tags = ['Units']
authenticateToken,  getUnitById);

// POST /api/units - Create new unit
router.post('/',
  // #swagger.tags = ['Units']
 authenticateToken, requireSuperAdmin, createUnit);

// PUT /api/units/:id - Update unit
router.put('/:id',
  // #swagger.tags = ['Units']
 authenticateToken,requireSuperAdmin, updateUnit);

// DELETE /api/units/:id - Delete unit
router.delete('/:id',
  // #swagger.tags = ['Units']
  authenticateToken, requireSuperAdmin, deleteUnit);

module.exports = router;