const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  //TODO: ADD FUNCTIOANLITY SO THAT THE USER HAS A UNIQUE which is generated so that the user can change their username
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
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;