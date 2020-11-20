var async = require('async');
var User = require('../models/user')

exports.register_get = function(req, res, next){
    res.render('register', {title: 'Signup'})
}

exports.register_post = function(req, res, next){
    // implement post
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    user.save(function(err){
        if(err) return next(err);
        res.render('register', {title: 'Signup', message: 'Registration successful'})
    })
}

exports.login_get = function(req, res, next){
    res.send('Not implemented yet')
}

exports.login_post = function(req, res, next){
    res.send('Not implemented yet')
}