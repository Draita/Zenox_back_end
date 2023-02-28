const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profilePicture: {
    type: Buffer,
    required: false,
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: 'HII I AM BOB'
  },
  token: {
    type: String,
    required: true,
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;