const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookId: { type: DataTypes.INTEGER, allowNull: false, field: 'book_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  loanDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'loan_date' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
  returnDate: { type: DataTypes.DATEONLY, field: 'return_date' },
  status: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'loans',
  underscored: true,
});

module.exports = Loan;
