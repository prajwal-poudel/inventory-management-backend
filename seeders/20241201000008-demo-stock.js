'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing products, inventories, and units
    const products = await queryInterface.sequelize.query(
      'SELECT id FROM product ORDER BY id LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const inventories = await queryInterface.sequelize.query(
      'SELECT id FROM inventory ORDER BY id LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const units = await queryInterface.sequelize.query(
      'SELECT id, name FROM units WHERE name IN ("KG", "BORI")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (products.length > 0 && inventories.length > 0 && units.length > 0) {
      const stockData = [];
      const now = new Date();
      const kgUnit = units.find(u => u.name === 'KG');
      const boriUnit = units.find(u => u.name === 'BORI');

      // Create stock entries for each product in each inventory
      for (const inventory of inventories) {
        for (const product of products) {
          // Add KG stock
          if (kgUnit) {
            stockData.push({
              stockQuantity: Math.floor(Math.random() * 1000) + 100, // Random quantity between 100-1100
              unit_id: kgUnit.id,
              product_id: product.id,
              inventory_id: inventory.id,
              createdAt: now,
              updatedAt: now
            });
          }

          // Add BORI stock
          if (boriUnit) {
            stockData.push({
              stockQuantity: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
              unit_id: boriUnit.id,
              product_id: product.id,
              inventory_id: inventory.id,
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }

      await queryInterface.bulkInsert('stock', stockData, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('stock', null, {});
  }
};