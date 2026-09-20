const mongoose = require('mongoose');

//Define user schema
const userSchema = new mongoose.Schema({
  first_name: {
     type: String,
      required: true 
    },
  last_name: {
     type: String, 
     required: true 
    },
  username: { 
    type: String,
     required: true,
      unique: true 
    },
  email: { 
    type: String,
     required: true,
      unique: true
     },
  password: { 
    type: String, 
    required: true },
  followers: [{
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
    }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);