var async = require('async');
var Book = require('../models/book');
var Author = require('../models/author');
const { validationResult } = require("express-validator");
const { authorFormValidation } = require('../validation/index');


const saveAuthor = [
    ...authorFormValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        } else {
            var authorObject = {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death              
            }
            if(req.params.id) authorObject._id = req.params.id;
            var author = new Author(authorObject);
            (() => {
                return req.params.id ? Author.findByIdAndUpdate(req.params.id, author, {}) : author.save()
            })().then((savedAuthor)=> {
                res.redirect(savedAuthor.url);
            })
            .catch((err)=> {
                return next(err)
            })

        }
    }
];

exports.author_list = function(req, res, next) {
    Author.find()
      .populate('author')
      .sort([['family_name', 'ascending']])
      .exec(function (err, list_authors) {
        if (err) return next(err); 
        res.render('author_list', { title: 'Author List', author_list: list_authors });
      });
  };

exports.author_detail = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) return next(err); 
        if (results.author == null) { 
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });

};

exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Create Author'});
};

exports.author_create_post = saveAuthor;

exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) return next(err); 
        if (results.author == null) { 
            res.redirect('/catalog/authors');
        }
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) return next(err); 
        if (results.authors_books.length > 0) {
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) return next(err); 
                res.redirect('/catalog/authors')
            })
        }
    });
};

exports.author_update_get = function(req, res) {
    Author.findById(req.params.id)
    .exec(function(err, author){
        if(err) return next(err)
        res.render('author_form', {title: 'Author Update', author: author})
    })
};

exports.author_update_post = saveAuthor;