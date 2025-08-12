'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for customer.coordinateId -> coordinate.id
    await queryInterface.addConstraint('customer', {
      fields: ['coordinateId'],
      type: 'foreign key',
      name: 'customer_coordinate_id_fk',
      references: {
        table: 'coordinate',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for coordinateId
    await queryInterface.addIndex('customer', ['coordinateId'], {
      name: 'customer_coordinate_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('customer', 'customer_coordinate_id_fk');
    
    // Remove the index
    await queryInterface.removeIndex('customer', 'customer_coordinate_id_idx');
  }
};