const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports.checkCookie = (req, res, next) => {
    next();
}