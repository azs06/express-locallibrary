var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
const user = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', userController.login_get);
router.get('/register', userController.register_get);
router.post('/register', userController.register_post);
router.post('/login', userController.login_post);


module.exports = router;
