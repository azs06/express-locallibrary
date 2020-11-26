var async = require('async');
var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');
const { bookFormValidation } = require('../validation/index');

const saveBook = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(typeof req.body.genre === 'undefined'){
            req.body.genre = [];
        }else{
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    // Validate and sanitize fields.
    ...bookFormValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        const bookObject = { 
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        };
        if(req.params.id){
            bookObject._id = req.params.id;
        }
        const book = new Book(bookObject);
        if (!errors.isEmpty()) {
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) return next(err); 
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }else {
            if(req.params.id){
                Book.findByIdAndUpdate(req.params.id, book, {}, function (err, updatedBook) {
                    if (err) return next(err);
                    res.redirect(updatedBook.url);
                });
            }else{
                book.save(function (err, savedBook) {
                    if (err) { return next(err); }
                    res.redirect(savedBook.url);
                });
            }

        }
    }
];


exports.index = function(req, res) {    
    async.parallel({
        book_count: function(callback) {
            // Pass an empty object as match condition to find all documents of this collection
            Book.countDocuments({}, callback); 
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
      .populate('author')
      .exec(function (err, list_books) {
        if (err) { return next(err); }
        res.render('book_list', { title: 'Book List', book_list: list_books });
      }); 
  };

exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {
          BookInstance.find({ 'book': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book == null) { 
            // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });

}

// Display book create form on GET.
exports.book_create_get = function(req, res) {
     // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};

// Handle book create on POST.
exports.book_create_post = saveBook;


// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {
          BookInstance.find({ 'book': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_delete', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Book delete POST');
    Book.findByIdAndRemove(req.body.bookid, function(err){
        if(err) return next(err)
        res.redirect('/catalog/books');
    })
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book == null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked = 'true';
                    }
                }
            }
            res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
        });

}

// Handle book update on POST.
exports.book_update_post = saveBook;