'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get users with driver role
    const driverUsers = await queryInterface.sequelize.query(
      'SELECT id FROM user WHERE role = "driver"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (driverUsers.length > 0) {
      const driversData = driverUsers.map((user, index) => ({
        user_id: user.id,
        phoneNumber: `+91987654321${index}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('driver', driversData, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('driver', null, {});
  }
};