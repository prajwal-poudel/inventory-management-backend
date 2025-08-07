'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('product', [
      {
        id: 1,
        productName: 'Basmati Rice',
        ratePerKg: 120.50,
        ratePerBori: 6025.00,
        description: 'Premium quality basmati rice',
        category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        productName: 'Wheat Flour',
        ratePerKg: 45.00,
        ratePerBori: 2250.00,
        description: 'Fine quality wheat flour',
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        productName: 'Toor Dal',
        ratePerKg: 85.00,
        ratePerBori: 4250.00,
        description: 'Yellow split pigeon peas',
        category_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        productName: 'Turmeric Powder',
        ratePerKg: 180.00,
        ratePerBori: 9000.00,
        description: 'Pure turmeric powder',
        category_id: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        productName: 'Sunflower Oil',
        ratePerKg: 150.00,
        ratePerBori: 7500.00,
        description: 'Refined sunflower cooking oil',
        category_id: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product', null, {});
  }
};