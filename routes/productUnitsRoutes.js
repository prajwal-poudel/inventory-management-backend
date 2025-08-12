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

// GET /api/product-units - Get all product units
router.get('/',
  // #swagger.tags = ['Product Units']
  getAllProductUnits);

// GET /api/product-units/product/:productId - Get product units by product ID
router.get('/product/:productId',
  // #swagger.tags = ['Product Units']
  getProductUnitsByProduct);

// GET /api/product-units/unit/:unitId - Get product units by unit ID
router.get('/unit/:unitId',
  // #swagger.tags = ['Product Units']
  getProductUnitsByUnit);

// GET /api/product-units/:productId/:unitId - Get specific product unit
router.get('/:productId/:unitId',
  // #swagger.tags = ['Product Units']
  getProductUnit);

// POST /api/product-units - Create new product unit
router.post('/',
  // #swagger.tags = ['Product Units']
  createProductUnit);

// POST /api/product-units/bulk - Create multiple product units for a product
router.post('/bulk',
  
  // #swagger.tags = ['Product Units']
  createBulkProductUnits);

// PUT /api/product-units/:id - Update product unit
router.put('/:id',
  // #swagger.tags = ['Product Units']
  updateProductUnit);

// DELETE /api/product-units/:id - Delete product unit
router.delete('/:id',
  // #swagger.tags = ['Product Units']
  deleteProductUnit);

module.exports = router;