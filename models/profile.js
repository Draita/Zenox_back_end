const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile-picture.png'
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = { Profile };