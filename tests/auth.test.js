const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

const { User, Role } = require('../models');
const authService = require('../services/auth.service');

const originals = {
  userCreate: User.create,
  userScope: User.scope,
  userFindByPk: User.findByPk,
  roleFindOne: Role.findOne,
};

test.afterEach(() => {
  User.create = originals.userCreate;
  User.scope = originals.userScope;
  User.findByPk = originals.userFindByPk;
  Role.findOne = originals.roleFindOne;
});

test('register fuerza el rol reader, cifra la contraseña y no la devuelve', async () => {
  Role.findOne = async () => ({ id: 3, name: 'reader' });
  let created;
  User.create = async (data) => {
    created = data;
    return { id: 8, ...data, Role: { name: 'reader' } };
  };

  const user = await authService.register({
    name: '  María Lectora ',
    email: ' MARIA@EXAMPLE.COM ',
    password: 'Clave123*',
  });

  assert.equal(created.roleId, 3);
  assert.equal(created.email, 'maria@example.com');
  assert.equal(await bcrypt.compare('Clave123*', created.password), true);
  assert.deepEqual(user, {
    id: 8,
    name: 'María Lectora',
    email: 'maria@example.com',
    role: 3,
    roleName: 'reader',
    status: 1,
  });
  assert.equal(user.password, undefined);
});

test('login devuelve JWT y usuario para credenciales activas', async () => {
  const password = await bcrypt.hash('Clave123*', 4);
  User.scope = () => ({
    findOne: async () => ({
      id: 8,
      name: 'María Lectora',
      email: 'maria@example.com',
      password,
      roleId: 3,
      status: 1,
      Role: { name: 'reader' },
    }),
  });

  const result = await authService.login({
    email: 'maria@example.com',
    password: 'Clave123*',
  });

  const payload = jwt.verify(result.token, 'test-secret');
  assert.equal(payload.id, 8);
  assert.equal(payload.role, 'reader');
  assert.equal(result.user.email, 'maria@example.com');
});

test('login usa el mismo 401 para usuario inexistente, inactivo o clave incorrecta', async () => {
  User.scope = () => ({ findOne: async () => null });
  await assert.rejects(
    authService.login({ email: 'nadie@example.com', password: 'Clave123*' }),
    { status: 401 },
  );

  const password = await bcrypt.hash('Clave123*', 4);
  User.scope = () => ({
    findOne: async () => ({ password, status: 0, Role: { name: 'reader' } }),
  });
  await assert.rejects(
    authService.login({ email: 'maria@example.com', password: 'Clave123*' }),
    { status: 401 },
  );

  User.scope = () => ({
    findOne: async () => ({ password, status: 1, Role: { name: 'reader' } }),
  });
  await assert.rejects(
    authService.login({ email: 'maria@example.com', password: 'Incorrecta1' }),
    { status: 401 },
  );
});

test('me devuelve el usuario autenticado y rechaza sesiones inexistentes', async () => {
  User.findByPk = async (id) => (id === 8 ? {
    id: 8,
    name: 'María Lectora',
    email: 'maria@example.com',
    roleId: 3,
    status: 1,
    Role: { name: 'reader' },
  } : null);

  assert.equal((await authService.me(8)).id, 8);
  await assert.rejects(authService.me(9), { status: 401 });
});

test('las rutas exponen registro, login y sesión actual protegida', () => {
  const router = require('../routes/auth.routes');
  const routes = router.stack.filter((layer) => layer.route).map((layer) => ({
    signature: `${Object.keys(layer.route.methods)[0]} ${layer.route.path}`,
    handlers: layer.route.stack.length,
  }));

  assert.deepEqual(routes, [
    { signature: 'post /register', handlers: 1 },
    { signature: 'post /login', handlers: 1 },
    { signature: 'get /me', handlers: 2 },
  ]);
});
