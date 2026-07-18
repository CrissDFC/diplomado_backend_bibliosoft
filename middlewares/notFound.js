const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
