import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [optionSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractPollId: {
    type: Number,
    required: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  endTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
pollSchema.index({ creator: 1, createdAt: -1 });
pollSchema.index({ isActive: 1, endTime: 1 });

export default mongoose.model('Poll', pollSchema);