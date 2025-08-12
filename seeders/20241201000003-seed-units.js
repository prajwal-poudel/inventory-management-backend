'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('units', [
      {
        name: 'KG',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'BORI',
        createdAt: now,
        updatedAt: now
      }
    ], {
      ignoreDuplicates: true // This will ignore if the records already exist
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('units', {
      name: {
        [Sequelize.Op.in]: ['KG', 'BORI']
      }
    }, {});
  }
};