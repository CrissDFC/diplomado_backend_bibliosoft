const AppError = require('./AppError');

function invalid(message) {
  throw new AppError(400, message);
}

function requireString(value, field, maxLength = 255) {
  if (typeof value !== 'string' || !value.trim()) invalid(`${field} es obligatorio`);
  const normalized = value.trim();
  if (normalized.length > maxLength) invalid(`${field} no puede superar ${maxLength} caracteres`);
  return normalized;
}

function optionalString(value, field, maxLength = 255) {
  if (value === undefined || value === null || value === '') return null;
  return requireString(value, field, maxLength);
}

function requireEmail(value) {
  const email = requireString(value, 'email', 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid('El correo electrónico no es válido');
  return email;
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 72
    || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    invalid('La contraseña debe tener entre 8 y 72 caracteres, mayúscula, minúscula y número');
  }
  return value;
}

function requirePositiveInteger(value, field) {
  if (!Number.isInteger(value) || value < 1) invalid(`${field} debe ser un entero positivo`);
  return value;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) invalid('El identificador no es válido');
  return id;
}

function requireDate(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    invalid(`${field} debe usar el formato YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    invalid(`${field} no es una fecha válida`);
  }
  return value;
}

module.exports = {
  requireString,
  optionalString,
  requireEmail,
  requirePassword,
  requirePositiveInteger,
  requireDate,
  parseId,
};
