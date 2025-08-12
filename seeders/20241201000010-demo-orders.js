'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get required data
    const customers = await queryInterface.sequelize.query(
      'SELECT id FROM customer ORDER BY id LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const products = await queryInterface.sequelize.query(
      'SELECT id FROM product ORDER BY id LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const inventories = await queryInterface.sequelize.query(
      'SELECT id FROM inventory ORDER BY id LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminUsers = await queryInterface.sequelize.query(
      'SELECT id FROM user WHERE role IN ("admin", "superadmin") LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const units = await queryInterface.sequelize.query(
      'SELECT id, name FROM units WHERE name IN ("KG", "BORI")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (customers.length > 0 && products.length > 0 && inventories.length > 0 && adminUsers.length > 0 && units.length > 0) {
      const ordersData = [];
      const now = new Date();
      const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
      const paymentMethods = ['cash', 'cheque', 'card', 'no'];

      // Create sample orders
      for (let i = 0; i < 10; i++) {
        const customer = customers[i % customers.length];
        const product = products[i % products.length];
        const inventory = inventories[i % inventories.length];
        const unit = units[i % units.length];
        const quantity = unit.name === 'KG' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 5) + 1;
        
        // Calculate total amount based on unit and quantity
        // This is a simplified calculation - in real scenario, you'd get rates from product_units
        const baseRate = unit.name === 'KG' ? 100 : 5000; // Simplified rates
        const totalAmount = quantity * baseRate;

        ordersData.push({
          customerId: customer.id,
          productId: product.id,
          inventoryId: inventory.id,
          orderVerifiedBy: adminUsers[0].id,
          quantity: quantity,
          unit_id: unit.id,
          status: statuses[i % statuses.length],
          paymentMethod: paymentMethods[i % paymentMethods.length],
          orderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
          totalAmount: totalAmount,
          createdAt: now,
          updatedAt: now
        });
      }

      await queryInterface.bulkInsert('order', ordersData, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order', null, {});
  }
};