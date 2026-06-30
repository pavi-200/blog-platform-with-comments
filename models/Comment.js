const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: [true, 'Comment cannot be empty.'],
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
