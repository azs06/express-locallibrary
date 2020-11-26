const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const { userRegistrationFormValidation, userLoginFormValidation } = require('../validation/index');

exports.register_get = function(req, res, next){
    res.render('register', {title: 'Signup'})
}

const initiateRegistration = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        new User({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        }).save()
            .then(() => {
                res.render('register', {title: 'Signup', message: 'Registration successful'})
            })
            .catch(error => {
                return next(error)
            }) 
    }else{
        res.render('register', {title: 'Signup', message: 'Please fix errors', errors: errors.array()})
    }

}
exports.register_post = [
    ...userRegistrationFormValidation,
    initiateRegistration
]

exports.login_get = function(req, res, next){
    res.render('login', {title: 'Login'})
}

exports.login_post = [
    ...userLoginFormValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const { email, password } = req.body;
            User.findOne({email: email})
                .then((user) => {
                    if(user && bcrypt.compareSync(password, user.password)){
                        req.session.user = user._id;
                        res.redirect('/users')
                    }
                })
        }else{
            res.render('login', {title: 'Login', errors: errors.array()})
        }

    }
]