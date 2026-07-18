'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loans', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      loan_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      return_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('loans', {
      fields: ['status'],
      type: 'check',
      where: { status: [0, 1, 2, 3] },
      name: 'loans_status_check',
    });
    await queryInterface.addConstraint('loans', {
      fields: ['loan_date', 'due_date', 'return_date'],
      type: 'check',
      where: Sequelize.literal('due_date >= loan_date AND (return_date IS NULL OR return_date >= loan_date)'),
      name: 'loans_dates_check',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('loans');
  },
};
