const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/user');

module.exports.loginRequired = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    res.redirect("/login");

};


module.exports.createUserSession = (req, res, next) => {

}

module.exports.loadUserFromSession = (req, res, next) => {
    if (!(req.session && req.session.user)) {
        return next();
    }
    User.findById(req.session.user, (err, user) => {

        if(err) return next(err)
        if(!user) return next();

        user.password = undefined;
        req.user = user._id;
        res.locals.user = user;
        next();

    })
}