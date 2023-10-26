const express = require('express');
const commentRouter = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const authenticate = require('../authenticate');
const Comment = require ('../models/Comment');
const Article = require ('../models/Article');
const User = require ('../models/User');



commentRouter.route('/')
.get((req, res) => {
    res.statusCode = 403;
    res.end('GET is not supported for /comments. Please use comments/[articleid]')
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /comments. Please use comments/[articleid]')
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments. If you want to edit a specific comment, Please use comments/[articleId]/[commentId]')
})
.delete((req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /comments')
})


commentRouter.route('/:articleId')
// For getting all comments on a specific article with articleId
.get((req, res, next) => {
    Comment.find({article: req.params.articleId})
    .then(comments => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments)
    })
    .catch(err => next(err))
})

// For posting a new comment to article with articleId
//  Must be a user. User posting is the 'author' for new comment
.post(
    authenticate.verifyUser, 
    authenticate.verifyCreator, 
    (req, res, next) => {
        const {body} = req.body;

        Comment.create({
            body: body,
            author: req.user._id,
            article: req.params.articleId
        })
        .then(comment => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comment)
        })
        .catch(err => next(err))

})

// For editing an existing comment
// Must be a user. User must match author
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments/[articleId]. If you want to edit a specific comment, Please use comments/[articleId]/[commentId]')
})
// Must be a user. User must match author or be admin
.delete(authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /comments/[articleId]. Please use comments/[articleId]/[commentId]')
})

commentRouter.route('/:articleId/:commentId')
.get((req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /comments/[articleId]. Please use comments/[articleId]/[commentId]')
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /comments/[articleId]. Please use comments/[articleId]/[commentId]')
})
// .put()
// .delete()

module.exports = commentRouter;