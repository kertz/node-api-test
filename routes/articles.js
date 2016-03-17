'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');

const Article = require('../models/article');

router.get('/:id', function(request, response, next) {
  let id = request.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    let error = new Error('Not Found');
    error.status = 404;
    throw error;
  }
  
  Article.findById(id).exec().then(function (resource) {
    if (!resource) {
      let error = new Error('Not Found');
      error.status = 404;
      throw error;
    }
    response.status(200).json(resource);
  }).catch(function (error) {
    console.log(error);
    next(error);
  });
});

router.get('/', function(request, response, next) {
  let limit = request.query.limit;
  let sinceId = request.query.since_id;
  
  limit = !limit ? 5 : limit;

  let query = {};
  if (sinceId) {
    sinceId = new mongoose.Types.ObjectId(sinceId);
    query._id = { $gt: sinceId };
  }

  Article.find(query).limit(limit).exec().then(function (resource) {
    let articles = [];
    resource.forEach(function (article) {
      articles.push(article.toJSON({ skipAnnotations: true }))
    });
    response.status(200).json(articles);
  }).catch(function (error) {
    next(error);
  });
});

router.post('/', function(request, response, next) {
  const article = new Article(request.body);
  
  article.save().then(function (resource) {
    if (!resource) {
      let error = new Error('Internal Server Error');
      error.status = 500;
      throw error;
    }
    
    response.status(201).json(resource);
  }).catch(function (error) {
    next(error);
  });
});

router.post('/:id/annotations', function(request, response, next) {
  let id = request.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    let error = new Error('Not Found');
    error.status = 404;
    next(error);
  }
  
  Article.findById(id).exec().then(function (resource) {
    if (!resource) {
      let error = new Error('Not Found');
      error.status = 404;
      throw error;
    }
    
    // Check if a paragraph with the md5Hash exists, if not send a 404
    let paragraphs = resource.text.split(/\r\n\r\n|\r\r|\n\n/g);
    let paragraphExists = false;
    for (let i = 0; i < paragraphs.length; i++) {
      if (crypto.createHash('md5').update(paragraphs[i], 'utf8').digest('hex') === request.body.paragraph) {
        paragraphExists = true;
        break;
      }
    }

    if (!paragraphExists) {
      let error = new Error('The Reference Paragraph Not Found');
      error.status = 400;
      throw error;
    }
    
    // Check if there are already annotation for the paragraph, if so push to it, otherwise add a new paragraph and push to it
    let annotationsExist = false;
    for (let i = 0; i < resource.annotations.length; i++) {
      if (resource.annotations[i].paragraph === request.body.paragraph) {
        annotationsExist = true;
        resource.annotations[i].annotations.push({
          text: request.body.text
        });
        break;
      }
    }

    if (!annotationsExist) {
      resource.annotations.push({
        paragraph: request.body.paragraph,
        annotations: [{
          text: request.body.text
        }]
      });
    }
    
    // console.log(resource.annotation);
    resource.save().then(function (resource) {
      if (!resource) {
        let error = new Error('Internal Server Error');
        error.status = 500;
        next(error);
      }

      // Get the annotation for the paragraph and send it back or return error
      for (let i = 0; i < resource.annotations.length; i++) {
        if (resource.annotations[i].paragraph === request.body.paragraph) {
          response.status(201).json(resource.annotations[i]);
          break;
        }
      }
      let error = new Error('Internal Server Error');
      error.status = 500;
      throw error;
    }).catch(function (error) {
      next(error);
    });
  }).catch(function (error) {
    next(error);
  });
});

module.exports = router;
