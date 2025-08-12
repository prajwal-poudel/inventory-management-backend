'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      fullname: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      coordinateId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer');
  }
};