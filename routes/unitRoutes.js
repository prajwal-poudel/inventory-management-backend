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

// GET /api/units - Get all units
router.get('/',
  // #swagger.tags = ['Units']
  getAllUnits);

// GET /api/units/search - Search units by name
router.get('/search',
  // #swagger.tags = ['Units']
  searchUnits);

// GET /api/units/:id - Get unit by ID
router.get('/:id',
  // #swagger.tags = ['Units']
  getUnitById);

// POST /api/units - Create new unit
router.post('/',
  // #swagger.tags = ['Units']
  createUnit);

// PUT /api/units/:id - Update unit
router.put('/:id',
  // #swagger.tags = ['Units']
  updateUnit);

// DELETE /api/units/:id - Delete unit
router.delete('/:id',
  // #swagger.tags = ['Units']
  deleteUnit);

module.exports = router;