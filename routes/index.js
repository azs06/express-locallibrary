var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if(req.session && req.session.user){
    res.redirect('/dashboard');
  }else{
    res.redirect('/login');
  }

});

module.exports = router;
