'use strict';

if (!process.env.SKIP_CONFIG) {
  const config = require('./config');
  for (let property in config) {
    process.env[property] = config[property];
  }
}

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const db = require('./db');

const routes = require('./routes/index');

const app = express();

app.use(logger('dev'));

// Make sure the app parses JSON
app.use(bodyParser.json({ strict: true }));

app.use('/articles', routes.articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if ('dev' === process.env.NODE_ENV) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
