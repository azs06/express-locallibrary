var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:identifier', function(req, res, next){
  const message = req.params.identifier;
  res.send("You're so " + message)
})

module.exports = router;
