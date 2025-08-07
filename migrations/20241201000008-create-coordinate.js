'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coordinate', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lat: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      lng: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customer',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add index for foreign key
    await queryInterface.addIndex('coordinate', ['customer_id'], {
      name: 'coordinate_customer_id_idx'
    });

    // Add foreign key constraint to customer table
    await queryInterface.addConstraint('customer', {
      fields: ['coordinateId'],
      type: 'foreign key',
      name: 'customer_coordinate_fk',
      references: {
        table: 'coordinate',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint from customer table first
    await queryInterface.removeConstraint('customer', 'customer_coordinate_fk');
    await queryInterface.dropTable('coordinate');
  }
};