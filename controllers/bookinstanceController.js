var async = require('async');
var BookInstance = require('../models/bookinstance');
const { body, check, validationResult } = require('express-validator');
var Book = require('../models/book');
const book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
      
  };
// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {

    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance:  bookinstance });
    })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
    
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim().escape(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim().escape(),
    body('status').trim().escape(),
    body('due_back', 'Invalid date').custom((value, {req}) => {
        if(req.body.status !== 'Available'){
            return body('due_back', 'Invalid date').isLength({min : 1}).isISO8601().toDate()
        }
        return body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate()
    }),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        } else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance){
            console.log(bookinstance)
            if(err){
                return next(err);
            }
            res.render('bookinstance_delete', {title: 'Bookinstance Delete', bookinstance: bookinstance, book: bookinstance.book })
        })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid)
        .exec(function(err) {
            if(err) return next(err)
            res.redirect('/catalog/bookinstances')
        })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    async.parallel({
        bookinstance: function(callback){
          BookInstance.findById(req.params.id).populate('book').exec(callback)
        },
        books: function(callback){
          Book.find({}, 'title').exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.bookinstance == null) { 
            // No results.
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
          }
        // Successful, so render.
        res.render('bookinstance_form', { title: results.bookinstance.book.title, bookinstance:  results.bookinstance, book_list: results.books });
    })
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim().escape(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim().escape(),
    body('status').trim().escape(),
    body('due_back', 'Invalid date').custom((value, {req}) => {
        if(req.body.status !== 'Available' && !value){
            throw new Error('Please provide a valid date')
        }
        return check('due_back').isISO8601().toDate().withMessage('Invalid date')
    }),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Update BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        } else {
            // Data from form is valid.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, updatedBook) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(updatedBook.url);
                });
        }
    }
];