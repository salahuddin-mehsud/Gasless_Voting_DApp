import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  optionIndex: {
    type: Number,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate votes
voteSchema.index({ poll: 1, user: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);