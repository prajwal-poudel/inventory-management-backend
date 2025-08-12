'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customer',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      inventoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      orderVerifiedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.DOUBLE,
        allowNull: false
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
      status: {
        type: Sequelize.ENUM,
        values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        allowNull: false,
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: Sequelize.ENUM,
        values: ['cash', 'cheque', 'card', 'no'],
        allowNull: false,
        defaultValue: 'no'
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      totalAmount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addIndex('order', ['customerId'], {
      name: 'order_customer_id_idx'
    });

    await queryInterface.addIndex('order', ['productId'], {
      name: 'order_product_id_idx'
    });

    await queryInterface.addIndex('order', ['inventoryId'], {
      name: 'order_inventory_id_idx'
    });

    await queryInterface.addIndex('order', ['orderVerifiedBy'], {
      name: 'order_verified_by_idx'
    });

    await queryInterface.addIndex('order', ['unit_id'], {
      name: 'order_unit_id_idx'
    });

    // Add indexes for common queries
    await queryInterface.addIndex('order', ['status'], {
      name: 'order_status_idx'
    });

    await queryInterface.addIndex('order', ['orderDate'], {
      name: 'order_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order');
  }
};