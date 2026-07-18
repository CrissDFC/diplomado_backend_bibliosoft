const test = require('node:test');
const assert = require('node:assert/strict');
const Sequelize = require('sequelize');

const roleMigration = require('../migrations/202607170001-create-roles');
const userMigration = require('../migrations/202607170002-create-users');
const bookMigration = require('../migrations/202607170003-create-books');
const loanMigration = require('../migrations/202607170004-create-loans');
const roleSeeder = require('../seeders/202607170001-roles');

async function fieldsCreatedBy(migration) {
  let created;
  await migration.up({
    async createTable(name, fields) {
      created = { name, fields };
    },
    async addConstraint() {},
  }, Sequelize);
  return created;
}

test('las migraciones crean las cuatro tablas del modelo relacional', async () => {
  const tables = await Promise.all([
    fieldsCreatedBy(roleMigration),
    fieldsCreatedBy(userMigration),
    fieldsCreatedBy(bookMigration),
    fieldsCreatedBy(loanMigration),
  ]);

  assert.deepEqual(tables.map(({ name }) => name), ['roles', 'users', 'books', 'loans']);
});

test('usuarios y préstamos declaran sus llaves foráneas', async () => {
  const users = await fieldsCreatedBy(userMigration);
  const loans = await fieldsCreatedBy(loanMigration);

  assert.deepEqual(users.fields.role_id.references, { model: 'roles', key: 'id' });
  assert.deepEqual(loans.fields.user_id.references, { model: 'users', key: 'id' });
  assert.deepEqual(loans.fields.book_id.references, { model: 'books', key: 'id' });
});

test('correo e ISBN son únicos', async () => {
  const users = await fieldsCreatedBy(userMigration);
  const books = await fieldsCreatedBy(bookMigration);

  assert.equal(users.fields.email.unique, true);
  assert.equal(books.fields.isbn.unique, true);
});

test('el seeder crea los tres roles con IDs compatibles con React', async () => {
  let inserted;
  await roleSeeder.up({
    async bulkInsert(table, rows) {
      assert.equal(table, 'roles');
      inserted = rows;
    },
  });

  assert.deepEqual(inserted.map(({ id, name }) => [id, name]), [
    [1, 'admin'],
    [2, 'librarian'],
    [3, 'reader'],
  ]);
});

test('los modelos registran las relaciones principales', () => {
  const { Role, User, Book, Loan } = require('../models');

  assert.equal(User.associations.Role.target, Role);
  assert.equal(User.associations.Loans.target, Loan);
  assert.equal(Book.associations.Loans.target, Loan);
  assert.equal(Loan.associations.User.target, User);
  assert.equal(Loan.associations.Book.target, Book);
});
