'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('adminPassword', saltRounds);
    const managerPassword = await bcrypt.hash('managerPassword', saltRounds);
    const staffPassword = await bcrypt.hash('staffPassword', saltRounds);
    const userPassword = await bcrypt.hash('userPassword', saltRounds);

    await queryInterface.bulkInsert('user', [
      {
        id: 1,
        fullname: 'SuperAdmin',
        email: 'superadmin@inventory.com',
        password: adminPassword,
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        fullname: 'AdminManager',
        email: 'admin@inventory.com',
        password: managerPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        fullname: 'StaffMember',
        email: 'staff@inventory.com',
        password: staffPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        fullname: 'RegularUser',
        email: 'user@inventory.com',
        password: userPassword,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        fullname: 'JohnDoe',
        email: 'john.doe@inventory.com',
        password: userPassword,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};