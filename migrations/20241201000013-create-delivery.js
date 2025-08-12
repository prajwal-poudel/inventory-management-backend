'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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

    // Add foreign key indexes
    await queryInterface.addIndex('delivery', ['order_id'], {
      name: 'delivery_order_id_idx'
    });

    await queryInterface.addIndex('delivery', ['driver_id'], {
      name: 'delivery_driver_id_idx'
    });

    // Add unique constraint on order_id to ensure one delivery per order
    await queryInterface.addIndex('delivery', ['order_id'], {
      unique: true,
      name: 'delivery_order_id_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery');
  }
};