const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

test('authenticate acepta un JWT Bearer válido', () => {
  const token = jwt.sign({ id: 4, role: 'librarian' }, 'test-secret');
  const req = { headers: { authorization: `Bearer ${token}` } };
  let called = false;

  authenticate(req, {}, (error) => {
    assert.equal(error, undefined);
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.id, 4);
  assert.equal(req.user.role, 'librarian');
});

test('authenticate rechaza ausencia de token y token inválido', () => {
  authenticate({ headers: {} }, {}, (error) => assert.equal(error.status, 401));
  authenticate(
    { headers: { authorization: 'Bearer no-es-un-jwt' } },
    {},
    (error) => assert.equal(error.status, 401),
  );
});

test('authorize permite roles requeridos', () => {
  let called = false;
  authorize('admin', 'librarian')(
    { user: { role: 'librarian' } },
    {},
    (error) => {
      assert.equal(error, undefined);
      called = true;
    },
  );
  assert.equal(called, true);
});

test('authorize rechaza usuarios sin sesión o sin rol requerido', () => {
  authorize('admin')({}, {}, (error) => assert.equal(error.status, 401));
  authorize('admin')(
    { user: { role: 'reader' } },
    {},
    (error) => assert.equal(error.status, 403),
  );
});
