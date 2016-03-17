'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var annotationSchema = new Schema({
  _id: false,
  paragraph: { type: String, required: true },
  annotations: [{
    _id: false,
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true }
  }],
});

annotationSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    let annotations = [];
    if (ret.annotations && ret.annotations.length) {
      ret.annotations.forEach(function (annotation) {
        annotations.push({
          text: annotation.text,
          created_at: annotation.created_at.getTime()
        });
      });
    }
    
    return {
      paragraph: ret.paragraph,
      annotations: annotations
    };
  }
});

const articleSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  annotations: { type: [ annotationSchema ], default: []}
}, {
  collection: 'articles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const updatableFields = [ 'title', 'text'];

articleSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    if (options.skipAnnotations) {
      return {
        id: ret._id,
        title: ret.title,
        text: ret.text,
        created_at: ret.created_at.getTime(),
        updated_at: ret.updated_at.getTime()
      };
    }
    
    return {
      id: ret._id,
      title: ret.title,
      text: ret.text,
      annotations: ret.annotations,
      created_at: ret.created_at.getTime(),
      updated_at: ret.updated_at.getTime()
    };
  }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
