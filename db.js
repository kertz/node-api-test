'use strict';

const mongoose = require('mongoose');

// Use system Promise
mongoose.Promise = global.Promise;

if ('test' === process.env.NODE_ENV) {
  mongoose.connect(process.env.MONGO_PORT + '/' + process.env.MONGO_DB + '_test', {});
}
if ('dev' === process.env.NODE_ENV) {
  mongoose.connect(process.env.MONGO_PORT + '/' + process.env.MONGO_DB + '_dev', {});
}
if ('prod' === process.env.NODE_ENV) {
  mongoose.connect(process.env.MONGO_PORT + '/' + process.env.MONGO_DB, {});
}

module.exports = mongoose.connection;
