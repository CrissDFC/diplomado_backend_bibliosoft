const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Book = require('./Book');
const Loan = require('./Loan');

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });
User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(User, { foreignKey: 'userId' });
Book.hasMany(Loan, { foreignKey: 'bookId' });
Loan.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = { sequelize, Role, User, Book, Loan };
