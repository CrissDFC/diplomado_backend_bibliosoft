const test = require('node:test');
const assert = require('node:assert/strict');

const { Book } = require('../models');
const bookService = require('../services/book.service');

const originals = {
  findAll: Book.findAll,
  findByPk: Book.findByPk,
  create: Book.create,
};

test.afterEach(() => {
  Book.findAll = originals.findAll;
  Book.findByPk = originals.findByPk;
  Book.create = originals.create;
});

const validBook = {
  title: 'El principito',
  author: 'Antoine de Saint-Exupéry',
  isbn: '9780156012195',
  category: 'Infantil',
  publisher: 'Reynal & Hitchcock',
  year: 1943,
  totalCopies: 3,
  description: 'Una historia sobre amistad.',
};

test('lista libros y admite búsqueda y estado', async () => {
  let options;
  Book.findAll = async (received) => {
    options = received;
    return [{ id: 1 }];
  };

  assert.deepEqual(await bookService.getAll({ search: 'principito', status: '1' }), [{ id: 1 }]);
  assert.equal(options.order[0][0], 'title');
  assert.equal(options.where.status, 1);
});

test('crea un libro disponible con todas sus copias', async () => {
  let created;
  Book.create = async (data) => {
    created = data;
    return { id: 1, ...data };
  };

  const book = await bookService.create(validBook);

  assert.equal(created.availableCopies, 3);
  assert.equal(created.status, 1);
  assert.equal(book.title, 'El principito');
});

test('rechaza año y cantidades inválidas', async () => {
  await assert.rejects(bookService.create({ ...validBook, year: 3000 }), { status: 400 });
  await assert.rejects(bookService.create({ ...validBook, totalCopies: 0 }), { status: 400 });
});

test('actualiza datos sin perder ejemplares prestados', async () => {
  const instance = {
    id: 1,
    ...validBook,
    totalCopies: 3,
    availableCopies: 1,
    status: 1,
    async update(data) {
      Object.assign(this, data);
      return this;
    },
  };
  Book.findByPk = async () => instance;

  const book = await bookService.update(1, { ...validBook, totalCopies: 4, title: 'Nuevo título' });

  assert.equal(book.totalCopies, 4);
  assert.equal(book.availableCopies, 2);
  assert.equal(book.title, 'Nuevo título');
});

test('no permite reducir ejemplares por debajo de los prestados', async () => {
  Book.findByPk = async () => ({ ...validBook, totalCopies: 3, availableCopies: 1, status: 1 });
  await assert.rejects(
    bookService.update(1, { ...validBook, totalCopies: 1 }),
    { status: 409 },
  );
});

test('inactiva lógicamente y responde 404 para inexistentes', async () => {
  const instance = {
    status: 1,
    async update(data) {
      Object.assign(this, data);
      return this;
    },
  };
  Book.findByPk = async (id) => (id === 1 ? instance : null);

  assert.equal((await bookService.disable(1)).status, 0);
  await assert.rejects(bookService.getById(2), { status: 404 });
});

test('las rutas protegen lectura y restringen escritura al personal', () => {
  const router = require('../routes/book.routes');
  const routes = router.stack.filter((layer) => layer.route).map((layer) => ({
    signature: `${Object.keys(layer.route.methods)[0]} ${layer.route.path}`,
    handlers: layer.route.stack.length,
  }));

  assert.deepEqual(routes, [
    { signature: 'get /', handlers: 2 },
    { signature: 'get /:id', handlers: 2 },
    { signature: 'post /', handlers: 3 },
    { signature: 'put /:id', handlers: 3 },
    { signature: 'delete /:id', handlers: 3 },
  ]);
});
