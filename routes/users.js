var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
var { checkCookie } = require('../middleware/cookie');

/* GET users listing. */
router.get('/', checkCookie, function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', userController.login_get);
router.get('/register', userController.register_get);
router.post('/register', userController.register_post);
router.post('/login', userController.login_post);


module.exports = router;
