'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [{
      name: 'Administrador Biblioteca',
      email: 'admin@biblioteca.com',
      password: await bcrypt.hash('Admin123*', 10),
      role_id: 1,
      status: 1,
      created_at: now,
      updated_at: now,
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@biblioteca.com' });
  },
};
