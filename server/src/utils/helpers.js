import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const validateWalletAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatPollResponse = (poll) => {
  return {
    id: poll._id,
    question: poll.question,
    options: poll.options,
    creator: poll.creator,
    contractPollId: poll.contractPollId,
    totalVotes: poll.totalVotes,
    isActive: poll.isActive,
    endTime: poll.endTime,
    createdAt: poll.createdAt
  };
};

export const calculateVotePercentages = (options, totalVotes) => {
  if (totalVotes === 0) {
    return options.map(option => ({
      ...option.toObject(),
      percentage: 0
    }));
  }

  return options.map(option => ({
    ...option.toObject(),
    percentage: Math.round((option.votes / totalVotes) * 100)
  }));
};