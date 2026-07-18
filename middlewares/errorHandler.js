function errorHandler(error, req, res, next) {
  let status = error.status || 500;
  let message = error.message;

  if (error.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Ya existe un registro con esos datos';
  } else if (error.name === 'SequelizeValidationError') {
    status = 400;
    message = 'Los datos enviados no son válidos';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    status = 409;
    message = 'El registro está relacionado con otros datos';
  }

  const body = { message: status === 500 ? 'Error interno del servidor' : message };
  if (status !== 500 && error.details) body.errors = error.details;
  res.status(status).json(body);
}

module.exports = errorHandler;
