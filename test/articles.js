'use strict';

const config = require('../config.test');
for (let property in config) {
  process.env[property] = config[property];
}
process.env['SKIP_CONFIG'] = true; // Used to prevent the config file from loading again in app.js

const assert = require('assert');
const should = require('should');
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');

const Article = require('../models/article');

describe('/articles', function () {
  before(function() {
    mongoose.connection.db.dropCollection(Article.collection.name, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  });
  
  let article = { title: 'A test todo', text: "This is a text paragraph. \n\n This is another text paragraph." };
    
  describe('POST /article', function() {
    it('should create a new article resource and respond with the resource in JSON', function(done) {
      request(app)
        .post('/articles')
        .set('Accept', 'application/json')
        .send(article)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          
          let data = res.body;
          let keys = ['id', 'title', 'text', 'annotaions', 'created_at', 'updated_at'];
          keys.forEach(function (key, index) {
            data.should.have.property(key);
          });
          data.title.should.be.exactly(article.title).and.be.a.String();
          data.text.should.be.exactly(article.text).and.be.a.String();
          data.annotaions.should.eql([]);
          
          article = res.body;
          done();
        });
    });
  });
  
  describe('GET /articles/:id', function() {
    it('should respond with 404 for nonExistentId01', function(done) {
      request(app)
        .get('/articles/nonExistentId01')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    
    it('should respond with the json resource', function(done) {
      request(app)
        .get('/articles/' + article.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, article)
        .end(function (err, res) {
          if (err) return done(err);
          article = res.body;
          done();
        });
    });
  });
});
