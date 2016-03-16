'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var annotationSchema = new Schema({
  paragraph: { type: String, required: true },
  annotaions: [ String ]
});

const articleSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  annotations: [ annotationSchema ]
}, {
  collection: 'articles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const updatableFields = [
  'title', 'text'
];

articleSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    return {
      id: ret._id,
      title: ret.title,
      text: ret.text,
      annotaions: ret.annotaions ? ret.annotations : [],
      created_at: ret.created_at.getTime(),
      updated_at: ret.updated_at.getTime()
    };
  }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
