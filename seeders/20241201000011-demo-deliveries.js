'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get orders that are shipped or delivered
    const orders = await queryInterface.sequelize.query(
      'SELECT id FROM `order` WHERE status IN ("shipped", "delivered") ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const drivers = await queryInterface.sequelize.query(
      'SELECT id FROM driver ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (orders.length > 0 && drivers.length > 0) {
      const deliveriesData = [];
      const now = new Date();

      // Create deliveries for shipped/delivered orders
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const driver = drivers[i % drivers.length]; // Rotate through available drivers

        deliveriesData.push({
          order_id: order.id,
          driver_id: driver.id,
          createdAt: now,
          updatedAt: now
        });
      }

      if (deliveriesData.length > 0) {
        await queryInterface.bulkInsert('delivery', deliveriesData, {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('delivery', null, {});
  }
};