'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Article = require('../models/article');

router.get('/:id', function(request, response, next) {
  let id = request.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
  }
  
  Article.findById(id).exec().then(function (resource) {
    response.status(200).json(resource);
  }).catch(function (error) {
    next(error);
  });
});

router.post('/', function(request, response, next) {
  const article = new Article(request.body);
  
  article.save().then(function (resource) {
    // if (!resource) {
    //   response.status(201).json(resource);
    // }
    response.status(201).json(resource);
  }).catch(function (error) {
    next(error);
  });
});

module.exports = router;
