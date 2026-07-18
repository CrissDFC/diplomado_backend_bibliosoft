const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token de autenticación requerido'));
  }

  try {
    req.user = jwt.verify(authorization.slice(7), jwtSecret);
    return next();
  } catch {
    return next(new AppError(401, 'Token inválido o expirado'));
  }
}

module.exports = authenticate;
