'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('manages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
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
    await queryInterface.addIndex('manages', ['user_id'], {
      name: 'manages_user_id_idx'
    });

    await queryInterface.addIndex('manages', ['inventory_id'], {
      name: 'manages_inventory_id_idx'
    });

    // Add composite unique index to prevent duplicate user-inventory relationships
    await queryInterface.addIndex('manages', ['user_id', 'inventory_id'], {
      unique: true,
      name: 'manages_user_inventory_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('manages');
  }
};