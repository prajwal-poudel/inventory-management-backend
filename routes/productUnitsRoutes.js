const express = require('express');
const router = express.Router();
const {
  getAllProductUnits,
  getProductUnitsByProduct,
  getProductUnitsByUnit,
  getProductUnit,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
  createBulkProductUnits
} = require('../controller/productUnitsController');
const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} = require('../middleware/authMiddleware');

// GET /api/product-units - Get all product units
router.get('/',
  // #swagger.tags = ['Product Units']
authenticateToken,  getAllProductUnits);

// GET /api/product-units/product/:productId - Get product units by product ID
router.get('/product/:productId',
  // #swagger.tags = ['Product Units']
 authenticateToken, getProductUnitsByProduct);

// GET /api/product-units/unit/:unitId - Get product units by unit ID
router.get('/unit/:unitId',
  // #swagger.tags = ['Product Units']
 authenticateToken, getProductUnitsByUnit);

// GET /api/product-units/:productId/:unitId - Get specific product unit
router.get('/:productId/:unitId',
  // #swagger.tags = ['Product Units']
authenticateToken,  getProductUnit);

// POST /api/product-units - Create new product unit
router.post('/',
  // #swagger.tags = ['Product Units']
authenticateToken, requireSuperAdmin,  createProductUnit);

// POST /api/product-units/bulk - Create multiple product units for a product
router.post('/bulk',
  
  // #swagger.tags = ['Product Units']
 authenticateToken, requireSuperAdmin, createBulkProductUnits);

// PUT /api/product-units/:id - Update product unit
router.put('/:id',
  // #swagger.tags = ['Product Units']
 authenticateToken, requireSuperAdmin, updateProductUnit);

// DELETE /api/product-units/:id - Delete product unit
router.delete('/:id',
  // #swagger.tags = ['Product Units']
   authenticateToken, requireSuperAdmin, deleteProductUnit);

module.exports = router;