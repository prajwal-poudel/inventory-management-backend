'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customer', [
      {
        id: 1,
        fullname: 'Rajesh Kumar',
        phoneNumber: '+919876543210',
        address: '123 MG Road, Mumbai',
        coordinateId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        fullname: 'Priya Sharma',
        phoneNumber: '+919876543211',
        address: '456 Park Street, Delhi',
        coordinateId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        fullname: 'Amit Patel',
        phoneNumber: '+919876543212',
        address: '789 Brigade Road, Bangalore',
        coordinateId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        fullname: 'Sunita Gupta',
        phoneNumber: '+919876543213',
        address: '321 Anna Salai, Chennai',
        coordinateId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        fullname: 'Vikram Singh',
        phoneNumber: '+919876543214',
        address: '654 FC Road, Pune',
        coordinateId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customer', null, {});
  }
};