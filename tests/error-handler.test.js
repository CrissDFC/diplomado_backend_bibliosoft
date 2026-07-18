const test = require('node:test');
const assert = require('node:assert/strict');

const AppError = require('../utils/AppError');
const notFound = require('../middlewares/notFound');
const errorHandler = require('../middlewares/errorHandler');

function response() {
  const result = {};
  return {
    result,
    res: {
      status(code) {
        result.status = code;
        return this;
      },
      json(body) {
        result.body = body;
      },
    },
  };
}

test('AppError conserva código y detalles de validación', () => {
  const error = new AppError(400, 'Datos inválidos', [{ field: 'email' }]);
  assert.equal(error.status, 400);
  assert.deepEqual(error.details, [{ field: 'email' }]);
});

test('notFound envía un error 404 al siguiente middleware', () => {
  notFound({ method: 'GET', originalUrl: '/api/missing' }, {}, (error) => {
    assert.equal(error.status, 404);
  });
});

test('errorHandler respeta errores esperados', () => {
  const { result, res } = response();
  errorHandler(new AppError(400, 'Datos inválidos'), {}, res, () => {});
  assert.deepEqual(result, { status: 400, body: { message: 'Datos inválidos' } });
});

test('errorHandler convierte duplicados en conflicto', () => {
  const error = new Error('Validation error');
  error.name = 'SequelizeUniqueConstraintError';
  const { result, res } = response();
  errorHandler(error, {}, res, () => {});
  assert.equal(result.status, 409);
});

test('errorHandler no expone errores internos', () => {
  const { result, res } = response();
  errorHandler(new Error('contraseña de postgres'), {}, res, () => {});
  assert.deepEqual(result, {
    status: 500,
    body: { message: 'Error interno del servidor' },
  });
});
