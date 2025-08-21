const express = require('express');
const router = express.Router();
const { getInventorySummary } = require('../controller/summaryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/summary
// Query: period=daily|weekly|monthly|yearly|all, inventoryId=optional
// Access: admin (only their managed inventories) and superadmin (all inventories or specific via inventoryId)
router.get('/',
  // #swagger.tags = ['Summary']
  // #swagger.summary = 'Get stock and sales summary'
  // #swagger.description = 'Returns aggregated sales (orders) and current stock by inventory for the requested period.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['period'] = {
      in: 'query',
      description: 'Aggregation period (daily|weekly|monthly|yearly|all)',
      required: true,
      type: 'string'
  } */
  /* #swagger.parameters['inventoryId'] = {
      in: 'query',
      description: 'Specific inventory ID (admins must manage it; superadmins can access any). If omitted: admins -> all they manage; superadmin -> all inventories',
      required: false,
      type: 'integer'
  } */
  authenticateToken,
  requireAdmin, // ensures only admin/superadmin can access; per-inventory enforcement is in controller
  getInventorySummary
);

module.exports = router;