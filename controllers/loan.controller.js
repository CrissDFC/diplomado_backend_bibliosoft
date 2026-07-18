const loanService = require('../services/loan.service');
const { parseId } = require('../utils/validators');

async function getAll(req, res, next) {
  try { res.status(200).json(await loanService.getAll(req.user, req.query)); }
  catch (error) { next(error); }
}

async function getById(req, res, next) {
  try { res.status(200).json(await loanService.getById(parseId(req.params.id), req.user)); }
  catch (error) { next(error); }
}

async function create(req, res, next) {
  try { res.status(201).json(await loanService.create(req.body)); }
  catch (error) { next(error); }
}

async function update(req, res, next) {
  try { res.status(200).json(await loanService.update(parseId(req.params.id), req.body)); }
  catch (error) { next(error); }
}

async function returnLoan(req, res, next) {
  try { res.status(200).json(await loanService.returnLoan(parseId(req.params.id))); }
  catch (error) { next(error); }
}

async function cancel(req, res, next) {
  try { res.status(200).json(await loanService.cancel(parseId(req.params.id))); }
  catch (error) { next(error); }
}

module.exports = { getAll, getById, create, update, returnLoan, cancel };
