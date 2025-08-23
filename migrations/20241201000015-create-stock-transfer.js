'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_transfers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stock',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sourceInventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      targetInventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      transferQuantity: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      transferDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_transit', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      transferredBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      receivedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      completedAt: {
        type: Sequelize.DATE,
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

    // Add indexes for better performance
    await queryInterface.addIndex('stock_transfers', ['stock_id'], {
      name: 'idx_stock_transfers_stock_id'
    });

    await queryInterface.addIndex('stock_transfers', ['sourceInventory_id'], {
      name: 'idx_stock_transfers_source_inventory_id'
    });

    await queryInterface.addIndex('stock_transfers', ['targetInventory_id'], {
      name: 'idx_stock_transfers_target_inventory_id'
    });

    await queryInterface.addIndex('stock_transfers', ['status'], {
      name: 'idx_stock_transfers_status'
    });

    await queryInterface.addIndex('stock_transfers', ['transferDate'], {
      name: 'idx_stock_transfers_transfer_date'
    });

    await queryInterface.addIndex('stock_transfers', ['transferredBy'], {
      name: 'idx_stock_transfers_transferred_by'
    });

    await queryInterface.addIndex('stock_transfers', ['receivedBy'], {
      name: 'idx_stock_transfers_received_by'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_transfers');
  }
};