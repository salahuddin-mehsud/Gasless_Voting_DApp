import User from '../models/User.js';
import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';

export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [pollsCreated, votesCast, totalPolls] = await Promise.all([
      Poll.countDocuments({ creator: userId }),
      Vote.countDocuments({ user: userId }),
      Poll.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          pollsCreated,
          votesCast,
          totalPolls
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserVotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const votes = await Vote.find({ user: userId })
      .populate({
        path: 'poll',
        populate: {
          path: 'creator',
          select: 'username walletAddress'
        }
      })
      .sort({ votedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vote.countDocuments({ user: userId });

    const formattedVotes = votes.map(vote => ({
      _id: vote._id,
      poll: vote.poll ? {
        _id: vote.poll._id,
        question: vote.poll.question,
        creator: vote.poll.creator
      } : null,
      optionIndex: vote.optionIndex,
      transactionHash: vote.transactionHash,
      votedAt: vote.votedAt
    }));

    res.json({
      success: true,
      data: {
        votes: formattedVotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};