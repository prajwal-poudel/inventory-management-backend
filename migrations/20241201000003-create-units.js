'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('units', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Unit name cannot be empty'
          },
          len: {
            args: [1, 50],
            msg: 'Unit name must be between 1 and 50 characters'
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

    // Add unique index for name
    await queryInterface.addIndex('units', ['name'], {
      unique: true,
      name: 'units_name_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('units');
  }
};