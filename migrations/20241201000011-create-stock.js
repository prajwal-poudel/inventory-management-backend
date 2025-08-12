'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      stockQuantity: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('stock', ['unit_id'], {
      name: 'stock_unit_id_idx'
    });

    await queryInterface.addIndex('stock', ['product_id'], {
      name: 'stock_product_id_idx'
    });

    await queryInterface.addIndex('stock', ['inventory_id'], {
      name: 'stock_inventory_id_idx'
    });

    // Add composite unique index to prevent duplicate stock entries for same product-inventory-unit combination
    await queryInterface.addIndex('stock', ['product_id', 'inventory_id', 'unit_id'], {
      unique: true,
      name: 'stock_product_inventory_unit_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock');
  }
};