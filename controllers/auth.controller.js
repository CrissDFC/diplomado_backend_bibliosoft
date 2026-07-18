const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    res.status(200).json(await authService.login(req.body));
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    res.status(200).json(await authService.me(req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
