'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('inventory', [
      {
        id: 1,
        inventoryName: 'Main Warehouse',
        address: '123 Industrial Area, City Center',
        contactNumber: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        inventoryName: 'Secondary Storage',
        address: '456 Storage Lane, Suburb',
        contactNumber: '+1234567891',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        inventoryName: 'Cold Storage Unit',
        address: '789 Refrigeration St, Industrial Zone',
        contactNumber: '+1234567892',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('inventory', null, {});
  }
};