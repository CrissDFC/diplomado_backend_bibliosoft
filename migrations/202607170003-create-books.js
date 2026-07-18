'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      title: { type: Sequelize.STRING(180), allowNull: false },
      author: { type: Sequelize.STRING(120), allowNull: false },
      isbn: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      category: { type: Sequelize.STRING(80), allowNull: false },
      publisher: { type: Sequelize.STRING(120), allowNull: true },
      year: { type: Sequelize.INTEGER, allowNull: false },
      total_copies: { type: Sequelize.INTEGER, allowNull: false },
      available_copies: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 1 },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('books', {
      fields: ['total_copies'],
      type: 'check',
      where: { total_copies: { [Sequelize.Op.gte]: 1 } },
      name: 'books_total_copies_check',
    });
    await queryInterface.addConstraint('books', {
      fields: ['available_copies', 'total_copies'],
      type: 'check',
      where: Sequelize.literal('available_copies >= 0 AND available_copies <= total_copies'),
      name: 'books_available_copies_check',
    });
    await queryInterface.addConstraint('books', {
      fields: ['status'],
      type: 'check',
      where: { status: [0, 1, 2] },
      name: 'books_status_check',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('books');
  },
};
