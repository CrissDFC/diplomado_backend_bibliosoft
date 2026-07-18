const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();
const staff = authorize('admin', 'librarian');
const admin = authorize('admin');

router.get('/', authenticate, staff, userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, admin, userController.create);
router.put('/:id', authenticate, admin, userController.update);
router.delete('/:id', authenticate, admin, userController.disable);

module.exports = router;
