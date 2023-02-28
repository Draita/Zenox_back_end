const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;