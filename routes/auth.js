var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.get('/login', userController.login_get);
router.get('/register', userController.register_get);
router.post('/register', userController.register_post);
router.post('/login', userController.login_post);


module.exports = router;
