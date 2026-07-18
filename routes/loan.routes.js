const express = require('express');
const loanController = require('../controllers/loan.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();
const staff = authorize('admin', 'librarian');

router.get('/', authenticate, loanController.getAll);
router.get('/:id', authenticate, loanController.getById);
router.post('/', authenticate, staff, loanController.create);
router.put('/:id', authenticate, staff, loanController.update);
router.put('/:id/return', authenticate, staff, loanController.returnLoan);
router.delete('/:id', authenticate, staff, loanController.cancel);

module.exports = router;
