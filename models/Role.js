const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(120) },
}, {
  tableName: 'roles',
  underscored: true,
});

module.exports = Role;
