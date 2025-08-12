'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('product', [
      {
        id: 1,
        productName: 'Basmati Rice',
        description: 'Premium quality basmati rice',
        category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        productName: 'Wheat Flour',
        description: 'Fine quality wheat flour',
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        productName: 'Toor Dal',
        description: 'Yellow split pigeon peas',
        category_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        productName: 'Turmeric Powder',
        description: 'Pure turmeric powder',
        category_id: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        productName: 'Sunflower Oil',
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