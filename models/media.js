const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
    trim: true
  }
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;