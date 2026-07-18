const express = require('express');
const bookController = require('../controllers/book.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();
const staff = authorize('admin', 'librarian');

router.get('/', authenticate, bookController.getAll);
router.get('/:id', authenticate, bookController.getById);
router.post('/', authenticate, staff, bookController.create);
router.put('/:id', authenticate, staff, bookController.update);
router.delete('/:id', authenticate, staff, bookController.disable);

module.exports = router;
