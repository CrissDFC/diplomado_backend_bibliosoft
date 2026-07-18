const test = require('node:test');
const assert = require('node:assert/strict');

const { sequelize, Loan, Book, User } = require('../models');
const loanService = require('../services/loan.service');

const originals = {
  transaction: sequelize.transaction,
  loanFindAll: Loan.findAll,
  loanFindByPk: Loan.findByPk,
  loanCreate: Loan.create,
  bookFindByPk: Book.findByPk,
  userFindByPk: User.findByPk,
};

test.afterEach(() => {
  sequelize.transaction = originals.transaction;
  Loan.findAll = originals.loanFindAll;
  Loan.findByPk = originals.loanFindByPk;
  Loan.create = originals.loanCreate;
  Book.findByPk = originals.bookFindByPk;
  User.findByPk = originals.userFindByPk;
});

function transaction() {
  return {
    LOCK: { UPDATE: 'UPDATE' },
    committed: false,
    rolledBack: false,
    async commit() { this.committed = true; },
    async rollback() { this.rolledBack = true; },
  };
}

function tomorrow() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

test('el lector lista únicamente sus préstamos', async () => {
  let options;
  Loan.findAll = async (received) => { options = received; return []; };

  await loanService.getAll({ id: 7, role: 'reader' });

  assert.equal(options.where.userId, 7);
});

test('el lector no puede consultar préstamos de otra persona', async () => {
  Loan.findByPk = async () => ({ id: 4, userId: 8 });
  await assert.rejects(
    loanService.getById(4, { id: 7, role: 'reader' }),
    { status: 403 },
  );
});

test('crear préstamo descuenta una copia y confirma la transacción', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  User.findByPk = async () => ({ id: 7, status: 1, name: 'Lector' });
  const book = {
    id: 3, title: 'Clean Code', status: 1, totalCopies: 2, availableCopies: 2,
    async update(data) { Object.assign(this, data); },
  };
  Book.findByPk = async () => book;
  Loan.create = async (data) => ({ id: 9, ...data });

  const loan = await loanService.create({ bookId: 3, userId: 7, dueDate: tomorrow() });

  assert.equal(book.availableCopies, 1);
  assert.equal(loan.status, 1);
  assert.equal(tx.committed, true);
  assert.equal(tx.rolledBack, false);
});

test('rechaza usuario inactivo y revierte la transacción', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  User.findByPk = async () => ({ id: 7, status: 0 });

  await assert.rejects(
    loanService.create({ bookId: 3, userId: 7, dueDate: tomorrow() }),
    { status: 409 },
  );
  assert.equal(tx.rolledBack, true);
});

test('rechaza libros sin ejemplares y revierte la transacción', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  User.findByPk = async () => ({ id: 7, status: 1 });
  Book.findByPk = async () => ({ id: 3, status: 2, availableCopies: 0 });

  await assert.rejects(
    loanService.create({ bookId: 3, userId: 7, dueDate: tomorrow() }),
    { status: 409 },
  );
  assert.equal(tx.rolledBack, true);
});

test('actualiza únicamente la fecha límite de un préstamo activo', async () => {
  const loan = {
    id: 9, loanDate: '2026-07-01', dueDate: '2026-07-08', status: 1,
    async update(data) { Object.assign(this, data); return this; },
  };
  Loan.findByPk = async () => loan;

  const updated = await loanService.update(9, { dueDate: '2026-07-20' });

  assert.equal(updated.dueDate, '2026-07-20');
});

test('devolver incrementa una sola copia y marca el préstamo devuelto', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  const book = {
    totalCopies: 3, availableCopies: 1, status: 2,
    async update(data) { Object.assign(this, data); },
  };
  const loan = {
    id: 9, bookId: 3, status: 1, loanDate: '2026-07-01',
    async update(data) { Object.assign(this, data); return this; },
  };
  Loan.findByPk = async () => loan;
  Book.findByPk = async () => book;

  const returned = await loanService.returnLoan(9);

  assert.equal(returned.status, 2);
  assert.equal(book.availableCopies, 2);
  assert.equal(book.status, 1);
  assert.equal(tx.committed, true);
});

test('cancelar restaura inventario y no permite repetir la operación', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  const book = {
    totalCopies: 2, availableCopies: 1, status: 1,
    async update(data) { Object.assign(this, data); },
  };
  const loan = {
    id: 9, bookId: 3, status: 1,
    async update(data) { Object.assign(this, data); return this; },
  };
  Loan.findByPk = async () => loan;
  Book.findByPk = async () => book;

  assert.equal((await loanService.cancel(9)).status, 0);
  assert.equal(book.availableCopies, 2);

  const secondTx = transaction();
  sequelize.transaction = async () => secondTx;
  await assert.rejects(loanService.cancel(9), { status: 409 });
  assert.equal(secondTx.rolledBack, true);
});

test('cierra préstamos sin combinar LEFT JOIN con FOR UPDATE', async () => {
  const tx = transaction();
  sequelize.transaction = async () => tx;
  const book = {
    totalCopies: 2, availableCopies: 1, status: 1,
    async update(data) { Object.assign(this, data); },
  };
  let loanOptions;
  let requestedBookId;
  Loan.findByPk = async (id, options) => {
    loanOptions = options;
    return {
      id, bookId: 3, status: 1,
      async update(data) { Object.assign(this, data); return this; },
    };
  };
  Book.findByPk = async (id) => { requestedBookId = id; return book; };

  await loanService.returnLoan(9);

  assert.equal(loanOptions.include, undefined);
  assert.equal(requestedBookId, 3);
});

test('las rutas restringen las mutaciones al personal', () => {
  const router = require('../routes/loan.routes');
  const routes = router.stack.filter((layer) => layer.route).map((layer) => ({
    signature: `${Object.keys(layer.route.methods)[0]} ${layer.route.path}`,
    handlers: layer.route.stack.length,
  }));

  assert.deepEqual(routes, [
    { signature: 'get /', handlers: 2 },
    { signature: 'get /:id', handlers: 2 },
    { signature: 'post /', handlers: 3 },
    { signature: 'put /:id', handlers: 3 },
    { signature: 'put /:id/return', handlers: 3 },
    { signature: 'delete /:id', handlers: 3 },
  ]);
});
