const { Op, fn, col, literal } = require('sequelize');
const { sequelize, Inventory, Order, Stock, Product, Unit, Manages } = require('../models');

// Helper: compute date range for period
function getDateRange(period) {
  const now = new Date();
  const end = new Date(now);
  end.setMilliseconds(999);
  end.setSeconds(59);
  end.setMinutes(59);
  end.setHours(23);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch ((period || '').toLowerCase()) {
    case 'daily':
      // today 00:00 - 23:59:59
      break;
    case 'weekly':
      // last 7 days inclusive ending today
      start.setDate(start.getDate() - 6);
      break;
    case 'monthly':
      // current calendar month to date
      start.setDate(1);
      break;
    case 'yearly':
      // current calendar year to date
      start.setMonth(0, 1); // Jan 1st
      start.setHours(0, 0, 0, 0);
      break;
    case 'all':
      // all time
      start.setTime(0); // 1970-01-01
      break;
    default:
      throw new Error('Invalid period. Use daily, weekly, monthly, yearly, or all');
  }
  return { start, end };
}

// Helper: inventories the user can access
async function getAccessibleInventoryIds(user, explicitInventoryId = null) {
  if (user.role === 'superadmin') {
    if (explicitInventoryId) return [Number(explicitInventoryId)];
    const all = await Inventory.findAll({ attributes: ['id'], raw: true });
    return all.map(r => r.id);
  }
  // Admin: only inventories they manage
  if (user.role === 'admin') {
    const manages = await Manages.findAll({
      where: { user_id: user.id },
      attributes: ['inventory_id'],
      raw: true
    });
    const managedIds = manages.map(m => m.inventory_id);
    if (explicitInventoryId) {
      const id = Number(explicitInventoryId);
      if (!managedIds.includes(id)) {
        const err = new Error('Access denied for the specified inventory');
        err.statusCode = 403;
        throw err;
      }
      return [id];
    }
    return managedIds;
  }
  const err = new Error('Only admin or superadmin can access summaries');
  err.statusCode = 403;
  throw err;
}

// GET /api/summary?period=daily|weekly|monthly&inventoryId=optional
// Returns sales (orders) and stock snapshot aggregated per inventory
const getInventorySummary = async (req, res) => {
  try {
    const { period, inventoryId } = req.query;
    if (!period) {
      return res.status(400).json({ success: false, message: "Query param 'period' is required (daily|weekly|monthly|yearly|all)" });
    }

    // Authorization and accessible inventories
    const inventoryIds = await getAccessibleInventoryIds(req.user, inventoryId);
    if (!inventoryIds.length) {
      return res.status(200).json({ success: true, message: 'No accessible inventories to summarize', data: { period: period.toLowerCase(), inventories: [] } });
    }

    const { start, end } = getDateRange(period);

    // Aggregate Orders (sales) within date range
    const salesAgg = await Order.findAll({
      where: {
        inventoryId: { [Op.in]: inventoryIds },
        orderDate: { [Op.between]: [start, end] },
        status: { [Op.not]: 'cancelled' } // exclude cancelled from sales
      },
      attributes: [
        'inventoryId',
        'productId',
        'unit_id',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalAmount')), 'revenue'],
        [fn('COUNT', col('id')), 'orders']
      ],
      group: ['inventoryId', 'productId', 'unit_id'],
      raw: true
    });

    // Stock snapshot (current)
    const stockAgg = await Stock.findAll({
      where: { inventory_id: { [Op.in]: inventoryIds } },
      attributes: [
        'inventory_id',
        'product_id',
        'unit_id',
        [fn('SUM', col('stockQuantity')), 'stockQuantity']
      ],
      group: ['inventory_id', 'product_id', 'unit_id'],
      raw: true
    });

    // Load metadata for name resolution
    const invRecords = await Inventory.findAll({ where: { id: { [Op.in]: inventoryIds } }, attributes: ['id', 'inventoryName'], raw: true });
    const productIds = Array.from(new Set([...salesAgg.map(r => r.productId), ...stockAgg.map(s => s.product_id)].filter(Boolean)));
    const unitIds = Array.from(new Set([...salesAgg.map(r => r.unit_id), ...stockAgg.map(s => s.unit_id)].filter(Boolean)));
    const prodRecords = productIds.length ? await Product.findAll({ where: { id: { [Op.in]: productIds } }, attributes: ['id', 'productName'], raw: true }) : [];
    const unitRecords = unitIds.length ? await Unit.findAll({ where: { id: { [Op.in]: unitIds } }, attributes: ['id', 'name'], raw: true }) : [];

    const invMap = Object.fromEntries(invRecords.map(i => [i.id, i]));
    const prodMap = Object.fromEntries(prodRecords.map(p => [p.id, p]));
    const unitMap = Object.fromEntries(unitRecords.map(u => [u.id, u]));

    // Group sales and stock by inventory
    const byInventory = new Map();
    for (const id of inventoryIds) {
      byInventory.set(id, {
        inventoryId: id,
        inventoryName: invMap[id] ? invMap[id].inventoryName : `Inventory ${id}`,
        sales: { totals: { orders: 0, quantity: 0, revenue: 0 }, byProduct: [] },
        stock: { snapshotAt: new Date(), totals: { items: 0, totalQuantity: 0 }, byProduct: [] }
      });
    }

    // Populate sales
    for (const row of salesAgg) {
      const bucket = byInventory.get(row.inventoryId);
      if (!bucket) continue;
      const product = prodMap[row.productId];
      const unit = unitMap[row.unit_id];
      const item = {
        productId: row.productId,
        productName: product ? product.productName : `Product ${row.productId}`,
        unit: unit ? { id: unit.id, name: unit.name } : { id: row.unit_id },
        quantitySold: Number(row.totalQuantity),
        orders: Number(row.orders),
        revenue: Number(Number(row.revenue).toFixed(2))
      };
      bucket.sales.byProduct.push(item);
      bucket.sales.totals.orders += item.orders;
      bucket.sales.totals.quantity += item.quantitySold;
      bucket.sales.totals.revenue = Number((bucket.sales.totals.revenue + item.revenue).toFixed(2));
    }

    // Populate stock
    for (const row of stockAgg) {
      const invId = row.inventory_id;
      const bucket = byInventory.get(invId);
      if (!bucket) continue;
      const product = prodMap[row.product_id];
      const unit = unitMap[row.unit_id];
      const qty = Number(row.stockQuantity);
      bucket.stock.byProduct.push({
        productId: row.product_id,
        productName: product ? product.productName : `Product ${row.product_id}`,
        unit: unit ? { id: unit.id, name: unit.name } : { id: row.unit_id },
        stockQuantity: qty
      });
      bucket.stock.totals.items += 1;
      bucket.stock.totals.totalQuantity += qty;
    }

    const inventories = Array.from(byInventory.values());

    return res.status(200).json({
      success: true,
      message: 'Summary generated successfully',
      data: {
        period: period.toLowerCase(),
        range: { start: getISOStringNoTZ(start), end: getISOStringNoTZ(end) },
        inventories
      }
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || 'Error generating summary' });
  }
};

function getISOStringNoTZ(d) {
  // For readability in response; preserves local timespan description
  try { return new Date(d).toISOString(); } catch { return String(d); }
}

module.exports = {
  getInventorySummary
};