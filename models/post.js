const mongoose = require('mongoose');

//Define post  schema
const postSchema = new mongoose.Schema({
title: {
     type: String, 
     required: true
     },
  content: { 
    type: String,
     required: true 
    },
  author: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User',
      required: true
     },
  state: { 
    type: String,
     enum: ['draft', 'published'], 
     default: 'draft'
     },
  tags: [{ 
    type: String
  }],
  likes: [{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User'
     }],
  like_count: { 
    type: Number,
     default: 0 
    },
  comment_count: { 
    type: Number, 
    default: 0 
}
}, 
{ timestamps: true }); 
  

module.exports = mongoose.model('Post', postSchema);


   