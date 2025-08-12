'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get admin and superadmin users
    const adminUsers = await queryInterface.sequelize.query(
      'SELECT id FROM user WHERE role IN ("admin", "superadmin")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const inventories = await queryInterface.sequelize.query(
      'SELECT id FROM inventory ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminUsers.length > 0 && inventories.length > 0) {
      const managesData = [];
      const now = new Date();

      // Assign each admin user to manage different inventories
      for (let i = 0; i < adminUsers.length; i++) {
        const user = adminUsers[i];
        // Each user manages at least one inventory, some may manage multiple
        const inventoryIndex = i % inventories.length;
        
        managesData.push({
          user_id: user.id,
          inventory_id: inventories[inventoryIndex].id,
          createdAt: now,
          updatedAt: now
        });

        // Superadmin manages all inventories
        if (i === 0) { // Assuming first user is superadmin
          for (let j = 1; j < inventories.length; j++) {
            managesData.push({
              user_id: user.id,
              inventory_id: inventories[j].id,
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }

      await queryInterface.bulkInsert('manages', managesData, {
        ignoreDuplicates: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('manages', null, {});
  }
};