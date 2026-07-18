const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(100), allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false, field: 'role_id' },
  status: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'users',
  underscored: true,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: { include: ['password'] } } },
});

module.exports = User;
