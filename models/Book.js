const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(180), allowNull: false },
  author: { type: DataTypes.STRING(120), allowNull: false },
  isbn: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(80), allowNull: false },
  publisher: { type: DataTypes.STRING(120) },
  year: { type: DataTypes.INTEGER, allowNull: false },
  totalCopies: { type: DataTypes.INTEGER, allowNull: false, field: 'total_copies' },
  availableCopies: { type: DataTypes.INTEGER, allowNull: false, field: 'available_copies' },
  status: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'books',
  underscored: true,
});

module.exports = Book;
