const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');
const {
  requireString,
  requireEmail,
  requirePassword,
} = require('../utils/validators');
const userDto = require('../utils/userDto');

function requireStatus(value) {
  if (![0, 1].includes(value)) throw new AppError(400, 'El estado del usuario no es válido');
  return value;
}

async function requireRole(value) {
  if (!Number.isInteger(value) || ![1, 2, 3].includes(value)) {
    throw new AppError(400, 'El rol del usuario no es válido');
  }
  const role = await Role.findByPk(value);
  if (!role) throw new AppError(400, 'El rol del usuario no existe');
  return role;
}

async function getAll(filters = {}) {
  const where = {};
  if (filters.status !== undefined && filters.status !== '') {
    where.status = requireStatus(Number(filters.status));
  }
  const users = await User.findAll({
    where,
    include: [{ model: Role, attributes: ['name'] }],
    order: [['name', 'ASC']],
  });
  return users.map(userDto);
}

async function getById(id, requester) {
  if (requester.role === 'reader' && requester.id !== id) {
    throw new AppError(403, 'Solo puede consultar su propio usuario');
  }
  const user = await User.findByPk(id, {
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return userDto(user);
}

async function create(data) {
  const role = await requireRole(data.role);
  const name = requireString(data.name, 'name', 100);
  const email = requireEmail(data.email);
  const password = requirePassword(data.password);
  const status = requireStatus(data.status);
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    roleId: role.id,
    status,
  });
  user.Role = role;
  return userDto(user);
}

async function update(id, data) {
  const user = await User.findByPk(id, {
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  const role = await requireRole(data.role);
  const changes = {
    name: requireString(data.name, 'name', 100),
    email: requireEmail(data.email),
    roleId: role.id,
    status: requireStatus(data.status),
  };
  if (data.password) changes.password = await bcrypt.hash(requirePassword(data.password), 10);
  await user.update(changes);
  user.Role = role;
  return userDto(user);
}

async function disable(id) {
  const user = await User.findByPk(id, {
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  await user.update({ status: 0 });
  return userDto(user);
}

module.exports = { getAll, getById, create, update, disable };
