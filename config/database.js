const { Sequelize } = require('sequelize');
const { database } = require('./env');

module.exports = new Sequelize(database.name, database.user, database.password, {
  host: database.host,
  port: database.port,
  dialect: 'postgres',
  logging: false,
});
