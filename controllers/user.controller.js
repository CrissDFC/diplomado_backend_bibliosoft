const userService = require('../services/user.service');
const { parseId } = require('../utils/validators');

async function getAll(req, res, next) {
  try { res.status(200).json(await userService.getAll(req.query)); }
  catch (error) { next(error); }
}

async function getById(req, res, next) {
  try { res.status(200).json(await userService.getById(parseId(req.params.id), req.user)); }
  catch (error) { next(error); }
}

async function create(req, res, next) {
  try { res.status(201).json(await userService.create(req.body)); }
  catch (error) { next(error); }
}

async function update(req, res, next) {
  try { res.status(200).json(await userService.update(parseId(req.params.id), req.body)); }
  catch (error) { next(error); }
}

async function disable(req, res, next) {
  try { res.status(200).json(await userService.disable(parseId(req.params.id))); }
  catch (error) { next(error); }
}

module.exports = { getAll, getById, create, update, disable };
