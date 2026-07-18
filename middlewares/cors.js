const { frontendUrl } = require('../config/env');
const AppError = require('../utils/AppError');

function cors(req, res, next) {
  const origin = req.headers.origin;
  if (origin && origin !== frontendUrl) return next(new AppError(403, 'Origen no permitido'));

  res.setHeader('Access-Control-Allow-Origin', frontendUrl);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

module.exports = cors;
