'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('coordinate', [
      {
        id: 1,
        lat: '19.0760',
        lng: '72.8777',
        customer_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        lat: '28.7041',
        lng: '77.1025',
        customer_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        lat: '12.9716',
        lng: '77.5946',
        customer_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        lat: '13.0827',
        lng: '80.2707',
        customer_id: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        lat: '18.5204',
        lng: '73.8567',
        customer_id: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Update customers with their coordinate IDs
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = 1 WHERE id = 1');
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = 2 WHERE id = 2');
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = 3 WHERE id = 3');
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = 4 WHERE id = 4');
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = 5 WHERE id = 5');
  },

  async down(queryInterface, Sequelize) {
    // Reset coordinateId in customers first
    await queryInterface.sequelize.query('UPDATE customer SET coordinateId = NULL WHERE coordinateId IS NOT NULL');
    
    await queryInterface.bulkDelete('coordinate', null, {});
  }
};