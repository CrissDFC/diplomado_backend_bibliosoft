const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const { User, Role } = require('../models');
const userService = require('../services/user.service');

const originals = {
  findAll: User.findAll,
  findByPk: User.findByPk,
  create: User.create,
  roleFindByPk: Role.findByPk,
};

test.afterEach(() => {
  User.findAll = originals.findAll;
  User.findByPk = originals.findByPk;
  User.create = originals.create;
  Role.findByPk = originals.roleFindByPk;
});

test('lista usuarios mediante DTO sin contraseña', async () => {
  User.findAll = async () => [{
    id: 1, name: 'Admin', email: 'admin@example.com', password: 'hash',
    roleId: 1, status: 1, Role: { name: 'admin' },
  }];

  const users = await userService.getAll();

  assert.equal(users[0].role, 1);
  assert.equal(users[0].roleName, 'admin');
  assert.equal(users[0].password, undefined);
});

test('el lector solo puede consultar su propio usuario', async () => {
  User.findByPk = async () => ({
    id: 3, name: 'Lector', email: 'lector@example.com',
    roleId: 3, status: 1, Role: { name: 'reader' },
  });

  assert.equal((await userService.getById(3, { id: 3, role: 'reader' })).id, 3);
  await assert.rejects(
    userService.getById(3, { id: 4, role: 'reader' }),
    { status: 403 },
  );
});

test('crea usuario con rol válido y contraseña cifrada', async () => {
  Role.findByPk = async () => ({ id: 2, name: 'librarian' });
  let created;
  User.create = async (data) => {
    created = data;
    return { id: 2, ...data };
  };

  const user = await userService.create({
    name: 'Bibliotecaria',
    email: 'biblio@example.com',
    password: 'Clave123*',
    role: 2,
    status: 1,
  });

  assert.equal(await bcrypt.compare('Clave123*', created.password), true);
  assert.equal(user.roleName, 'librarian');
  assert.equal(user.password, undefined);
});

test('rechaza roles y estados desconocidos', async () => {
  Role.findByPk = async () => null;
  await assert.rejects(userService.create({
    name: 'Persona', email: 'persona@example.com', password: 'Clave123*', role: 9, status: 1,
  }), { status: 400 });

  Role.findByPk = async () => ({ id: 2, name: 'librarian' });
  await assert.rejects(userService.create({
    name: 'Persona', email: 'persona@example.com', password: 'Clave123*', role: 2, status: 4,
  }), { status: 400 });
});

test('actualiza sin exigir ni reemplazar contraseña cuando viene vacía', async () => {
  const instance = {
    id: 2, name: 'Antes', email: 'antes@example.com', password: 'hash-anterior',
    roleId: 2, status: 1, Role: { name: 'librarian' },
    async update(data) {
      assert.equal(data.password, undefined);
      Object.assign(this, data);
      return this;
    },
  };
  User.findByPk = async () => instance;
  Role.findByPk = async () => ({ id: 2, name: 'librarian' });

  const user = await userService.update(2, {
    name: 'Después', email: 'despues@example.com', password: '', role: 2, status: 1,
  });

  assert.equal(user.name, 'Después');
  assert.equal(user.password, undefined);
});

test('inactiva usuarios y responde 404 para inexistentes', async () => {
  const instance = {
    id: 2, roleId: 2, Role: { name: 'librarian' }, status: 1,
    async update(data) { Object.assign(this, data); return this; },
  };
  User.findByPk = async (id) => (id === 2 ? instance : null);

  assert.equal((await userService.disable(2)).status, 0);
  await assert.rejects(userService.disable(4), { status: 404 });
});

test('las rutas permiten lectura al personal y escritura solo al administrador', () => {
  const router = require('../routes/user.routes');
  const routes = router.stack.filter((layer) => layer.route).map((layer) => ({
    signature: `${Object.keys(layer.route.methods)[0]} ${layer.route.path}`,
    handlers: layer.route.stack.length,
  }));

  assert.deepEqual(routes, [
    { signature: 'get /', handlers: 3 },
    { signature: 'get /:id', handlers: 2 },
    { signature: 'post /', handlers: 3 },
    { signature: 'put /:id', handlers: 3 },
    { signature: 'delete /:id', handlers: 3 },
  ]);
});
