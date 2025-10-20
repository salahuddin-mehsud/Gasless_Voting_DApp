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
    type: String
  },
  voterAddress: {  
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


voteSchema.index({ poll: 1, voterAddress: 1 }, { unique: true });
export default mongoose.model('Vote', voteSchema);