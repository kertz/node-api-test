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
const crypto = require('crypto');

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
  
  let article = { title: 'A test todo', text: "This is a text paragraph.\n\nThis is another text paragraph separated by two line feeds.\r\rAnother paragraph here separated by two carriage returns.\r\n\r\nAnd then we have another line separated by two CR+LF." };
    
  describe('POST /articles', function() {
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
          let keys = ['id', 'title', 'text', 'annotations', 'created_at', 'updated_at'];
          keys.forEach(function (key, index) {
            data.should.have.property(key);
          });

          data.title.should.be.exactly(article.title).and.be.a.String();
          data.text.should.be.exactly(article.text).and.be.a.String();
          data.annotations.should.eql([]);

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
  
  describe('POST /article/:id/annotations', function() {
    let md5Hash = crypto.createHash('md5');
    md5Hash.update("This is another text paragraph separated by two line feeds.", 'utf8');
    let annotation = {
      paragraph: md5Hash.digest('hex'),
      text: "This is a comment"
    };
        
    it('should add new annotation to the article resource and respond with the annotations for the paragraph', function(done) {
      request(app)
        .post('/articles/' + article.id + '/annotations')
        .set('Accept', 'application/json')
        .send(annotation)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          
          let data = res.body;
          let keys = ['paragraph', 'annotations'];
          keys.forEach(function (key, index) {
            data.should.have.property(key);
          });
          
          data.paragraph.should.be.exactly(annotation.paragraph).and.be.a.String();
          data.annotations[0].text.should.be.exactly(annotation.text).and.be.a.String();
          should.exist(data.annotations[0].created_at);
          (data.annotations[0].created_at).should.be.a.Number();
          
          done();
        });
    });
  });
  
  describe('POST /article/:id/annotations', function() {
    let md5Hash = crypto.createHash('md5');
    md5Hash.update("A non existent paragraph.", 'utf8');
    let annotation = {
      paragraph: md5Hash.digest('hex'),
      text: "This is a comment"
    };
    
    it('should return 404 because the paragraph does not exist', function(done) {
      request(app)
        .post('/articles/' + article.id + '/annotations')
        .set('Accept', 'application/json')
        .send(annotation)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          
          let data = res.body;
          data.message.should.be.exactly("The Reference Paragraph Not Found").and.be.a.String();
          
          done();
        });
    });
  });
  
  
  describe('GET /articles/:id', function() {
    it('should respond with the json resource that contains the annotations', function(done) {
      request(app)
        .get('/articles/' + article.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          let data = res.body;
          
          data.id.should.be.exactly(article.id).and.be.a.String();
          should.exist(data.annotations);
          data.annotations.should.be.an.Array();
          
          let md5Hash = crypto.createHash('md5');
          md5Hash.update("This is another text paragraph separated by two line feeds.", 'utf8');
          let annotation = {
            paragraph: md5Hash.digest('hex'),
            text: "This is a comment"
          };
          data.annotations[0].paragraph.should.be.exactly(annotation.paragraph).and.be.a.String();
          data.annotations[0].annotations.length.should.be.exactly(1);
          data.annotations[0].annotations[0].text.should.be.exactly(annotation.text);
          should.exist(data.annotations[0].annotations[0].created_at);
          data.annotations[0].annotations[0].created_at.should.be.a.Number();
          
          done();
        });
    });
  });
});
