const AppError = require('../utils/AppError');

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'Usuario no autenticado'));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError(403, 'No tiene permisos para realizar esta acción'));
    }
    return next();
  };
}

module.exports = authorize;
