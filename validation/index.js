const { body } = require('express-validator');

module.exports.bookFormValidation = [
    body('title', 'Title must not be empty.').isLength({ min: 5 }).trim().escape(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim().escape(),
    body('genre.*').escape(),
]

module.exports.authorFormValidation = [
    body('first_name').isLength({ min: 1 }).trim().escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
];

module.exports.userRegistrationFormValidation = [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Name must be minimum 3 characters long').trim().escape(),
    body('email').notEmpty().withMessage('Emails is required').isEmail().withMessage('Invalid Email').isLength({ min: 5 }).withMessage('Email must be minimum 5 characters long').trim().escape(),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be minimum 8 characters long').trim().escape(),
]

module.exports.userLoginFormValidation = [
    body('email').notEmpty().withMessage('Emails is required').isEmail().withMessage('Invalid Email').isLength({ min: 5 }).withMessage('Email must be minimum 5 characters long').trim().escape(),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be minimum 8 characters long').trim().escape(),
]