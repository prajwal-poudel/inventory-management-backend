'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'order',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'driver',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Add indexes for foreign keys
    await queryInterface.addIndex('delivery', ['order_id'], {
      name: 'delivery_order_id_idx'
    });
    
    await queryInterface.addIndex('delivery', ['driver_id'], {
      name: 'delivery_driver_id_idx'
    });

    // Add unique constraint for order_id (one delivery per order)
    await queryInterface.addIndex('delivery', ['order_id'], {
      unique: true,
      name: 'delivery_order_id_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery');
  }
};