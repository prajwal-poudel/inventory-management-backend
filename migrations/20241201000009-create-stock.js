'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stockKg: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      stockBori: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
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

    // Add indexes for foreign keys
    await queryInterface.addIndex('stock', ['product_id'], {
      name: 'stock_product_id_idx'
    });
    
    await queryInterface.addIndex('stock', ['inventory_id'], {
      name: 'stock_inventory_id_idx'
    });

    // Add unique constraint for product-inventory combination
    await queryInterface.addIndex('stock', ['product_id', 'inventory_id'], {
      unique: true,
      name: 'stock_product_inventory_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock');
  }
};