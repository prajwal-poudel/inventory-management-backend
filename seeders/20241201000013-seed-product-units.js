'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing products and units
    const products = await queryInterface.sequelize.query(
      'SELECT id FROM product ORDER BY id LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const units = await queryInterface.sequelize.query(
      'SELECT id, name FROM units WHERE name IN ("KG", "BORI")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (products.length > 0 && units.length > 0) {
      const now = new Date();
      const productUnitsData = [];

      const kgUnit = units.find(u => u.name === 'KG');
      const boriUnit = units.find(u => u.name === 'BORI');

      // Define specific rates for each product (matching the original rates from the old seeder)
      const productRates = {
        1: { kg: 120.50, bori: 6025.00 }, // Basmati Rice
        2: { kg: 45.00, bori: 2250.00 },  // Wheat Flour
        3: { kg: 85.00, bori: 4250.00 },  // Toor Dal
        4: { kg: 180.00, bori: 9000.00 }, // Turmeric Powder
        5: { kg: 150.00, bori: 7500.00 }  // Sunflower Oil
      };

      // Create product units with specific rates
      for (const product of products) {
        const rates = productRates[product.id];
        
        if (kgUnit && rates) {
          productUnitsData.push({
            product_id: product.id,
            unit_id: kgUnit.id,
            rate: rates.kg,
            createdAt: now,
            updatedAt: now
          });
        }

        if (boriUnit && rates) {
          productUnitsData.push({
            product_id: product.id,
            unit_id: boriUnit.id,
            rate: rates.bori,
            createdAt: now,
            updatedAt: now
          });
        }
      }

      if (productUnitsData.length > 0) {
        await queryInterface.bulkInsert('product_units', productUnitsData, {
          ignoreDuplicates: true
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_units', null, {});
  }
};