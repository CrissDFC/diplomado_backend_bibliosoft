const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');
const { requireString, requireEmail, requirePassword } = require('../utils/validators');
const userDto = require('../utils/userDto');

async function register(data) {
  const name = requireString(data.name, 'name', 100);
  const email = requireEmail(data.email);
  const password = requirePassword(data.password);
  const role = await Role.findOne({ where: { name: 'reader' } });
  if (!role) throw new AppError(500, 'El rol reader no está configurado');

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    roleId: role.id,
    status: 1,
  });
  user.Role = role;
  return userDto(user);
}

async function login(data) {
  const email = requireEmail(data.email);
  const password = requireString(data.password, 'password', 72);
  const user = await User.scope('withPassword').findOne({
    where: { email },
    include: [{ model: Role, attributes: ['name'] }],
  });

  if (!user || user.status !== 1 || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Credenciales inválidas');
  }
  if (!jwtSecret) throw new AppError(500, 'JWT_SECRET no está configurado');

  return {
    token: jwt.sign({ id: user.id, role: user.Role.name }, jwtSecret, { expiresIn: '1h' }),
    user: userDto(user),
  };
}

async function me(id) {
  const user = await User.findByPk(id, {
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!user || user.status !== 1) throw new AppError(401, 'La sesión ya no es válida');
  return userDto(user);
}

module.exports = { register, login, me };
