import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';
import { createPollOnChain, voteOnChain, getPollFromChain } from '../services/blockchainService.js';
import { formatPollResponse, calculateVotePercentages } from '../utils/helpers.js';
import mongoose from 'mongoose';

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, durationInMinutes } = req.body;
    const userId = req.user._id;

    // Create poll on blockchain
    const blockchainResult = await createPollOnChain(question, options, durationInMinutes);
    
    if (!blockchainResult.success) {
      return res.status(400).json({
        success: false,
        message: `Blockchain error: ${blockchainResult.error}`
      });
    }

    // Calculate end time
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + parseInt(durationInMinutes));

    // Save poll to database
    const poll = await Poll.create({
      question: question.trim(),
      options: options.map(option => ({ text: option.trim() })),
      creator: userId,
      contractPollId: parseInt(blockchainResult.pollId),
      endTime,
      totalVotes: 0
    });

    await poll.populate('creator', 'username walletAddress');

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: {
        poll: formatPollResponse(poll),
        transactionHash: blockchainResult.transactionHash
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid poll ID format'
      });
    }

    const poll = await Poll.findById(id).populate('creator', 'username walletAddress');
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user has voted
    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({ 
        poll: id, 
        user: req.user._id 
      });
      userVote = vote ? vote.optionIndex : null;
    }

    // Get results from blockchain for verification
    const blockchainPoll = await getPollFromChain(poll.contractPollId);
    
    const response = formatPollResponse(poll);
    response.optionsWithPercentages = calculateVotePercentages(poll.options, poll.totalVotes);
    response.userVote = userVote;
    response.blockchainVerified = blockchainPoll.success;

    res.json({
      success: true,
      data: {
        poll: response
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getPolls = async (req, res, next) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.endTime = { $gt: new Date() };
    } else if (status === 'ended') {
      query.$or = [
        { isActive: false },
        { endTime: { $lte: new Date() } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('creator', 'username walletAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments(query);

    res.json({
      success: true,
      data: {
        polls: polls.map(formatPollResponse),
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



export const vote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid poll ID format'
      });
    }

    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (!poll.isActive || new Date() > poll.endTime) {
      poll.isActive = false;
      await poll.save();
      
      return res.status(400).json({
        success: false,
        message: 'Poll has ended'
      });
    }

    // Check if option is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option'
      });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      poll: id, 
      user: userId 
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Vote on blockchain
    const blockchainResult = await voteOnChain(
      poll.contractPollId, 
      optionIndex, 
      req.user.walletAddress
    );

    if (!blockchainResult.success) {
      return res.status(400).json({
        success: false,
        message: `Voting failed: ${blockchainResult.error}`
      });
    }

    // Update poll in database
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    // Record vote
    await Vote.create({
      poll: id,
      user: userId,
      optionIndex,
      transactionHash: blockchainResult.transactionHash
    });

    const updatedPoll = await Poll.findById(id).populate('creator', 'username walletAddress');
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        poll: formatPollResponse(updatedPoll),
        transactionHash: blockchainResult.transactionHash
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPolls = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const polls = await Poll.find({ creator: userId })
      .populate('creator', 'username walletAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments({ creator: userId });

    res.json({
      success: true,
      data: {
        polls: polls.map(formatPollResponse),
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