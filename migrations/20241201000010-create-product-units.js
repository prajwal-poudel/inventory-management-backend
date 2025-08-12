'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_units', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rate: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'Rate must be a positive number'
          },
          isNumeric: {
            msg: 'Rate must be a valid number'
          }
        }
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
    await queryInterface.addIndex('product_units', ['product_id'], {
      name: 'product_units_product_id_idx'
    });

    await queryInterface.addIndex('product_units', ['unit_id'], {
      name: 'product_units_unit_id_idx'
    });

    // Add composite unique index to prevent duplicate product-unit combinations
    await queryInterface.addIndex('product_units', ['product_id', 'unit_id'], {
      unique: true,
      name: 'product_units_product_unit_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_units');
  }
};