const test = require('node:test');
const assert = require('node:assert/strict');

const {
  requireEmail,
  requirePassword,
  requirePositiveInteger,
  requireDate,
  parseId,
} = require('../utils/validators');

test('acepta y normaliza un correo válido', () => {
  assert.equal(requireEmail('  ADMIN@Biblioteca.com '), 'admin@biblioteca.com');
});

test('rechaza correo inválido', () => {
  assert.throws(() => requireEmail('correo-invalido'), { status: 400 });
});

test('exige contraseña fuerte', () => {
  assert.equal(requirePassword('Clave123*'), 'Clave123*');
  assert.throws(() => requirePassword('12345678'), { status: 400 });
});

test('valida enteros positivos e identificadores', () => {
  assert.equal(requirePositiveInteger(3, 'totalCopies'), 3);
  assert.equal(parseId('7'), 7);
  assert.throws(() => requirePositiveInteger(0, 'totalCopies'), { status: 400 });
  assert.throws(() => parseId('abc'), { status: 400 });
});

test('acepta únicamente fechas reales en formato ISO', () => {
  assert.equal(requireDate('2026-07-17', 'dueDate'), '2026-07-17');
  assert.throws(() => requireDate('2026-02-30', 'dueDate'), { status: 400 });
  assert.throws(() => requireDate('17/07/2026', 'dueDate'), { status: 400 });
});
