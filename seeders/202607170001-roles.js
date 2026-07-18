'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'admin', description: 'Administrador', created_at: now, updated_at: now },
      { id: 2, name: 'librarian', description: 'Bibliotecario', created_at: now, updated_at: now },
      { id: 3, name: 'reader', description: 'Lector', created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { id: [1, 2, 3] });
  },
};
