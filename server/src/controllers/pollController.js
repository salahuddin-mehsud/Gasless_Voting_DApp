import { ethers } from 'ethers';
import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';
import { createPollOnChain, voteOnChain, getPollFromChain, getNonce } from '../services/blockchainService.js';
import { formatPollResponse, calculateVotePercentages } from '../utils/helpers.js';
import mongoose from 'mongoose';

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, durationInMinutes } = req.body;
    const userId = req.user._id;

    const blockchainResult = await createPollOnChain(question, options, durationInMinutes);
    
    if (!blockchainResult.success) {
      return res.status(400).json({
        success: false,
        message: `Blockchain error: ${blockchainResult.error}`
      });
    }

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + parseInt(durationInMinutes));

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

    // Auto-deactivate poll if end time has passed
    const now = new Date();
    if (poll.isActive && now > poll.endTime) {
      poll.isActive = false;
      await poll.save();
      console.log(`🔄 Auto-deactivated poll ${id} - end time passed`);
    }

    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({ 
        poll: id, 
        user: req.user._id 
      });
      userVote = vote ? vote.optionIndex : null;
    }

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
    console.log('🎯 Vote endpoint hit!');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user ? req.user._id : 'No user');

    const { id } = req.params;
    const { optionIndex, signature, nonce } = req.body;
    const userId = req.user._id;

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

    // Auto-deactivate poll if end time has passed
    const now = new Date();
    if (poll.isActive && now > poll.endTime) {
      poll.isActive = false;
      await poll.save();
      console.log(`🔄 Auto-deactivated poll ${id} during vote attempt`);
      
      return res.status(400).json({
        success: false,
        message: 'Poll has ended'
      });
    }

    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Poll has ended'
      });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option'
      });
    }

    // Check if this USER (database user) has already voted
    const existingVote = await Vote.findOne({ 
      poll: id, 
      user: userId 
    });

    if (existingVote) {
      console.log(`❌ Database user ${userId} already voted on poll ${id}`);
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // 🔥 GASLESS VOTING: Use the user's wallet address from database
    const userWalletAddress = req.user.walletAddress;
    console.log('🔍 Using user wallet address from database:', userWalletAddress);

    // Verify nonce matches current nonce on blockchain for THIS USER
    console.log('🔍 Verifying nonce on blockchain...');
    const currentNonce = await getNonce(userWalletAddress);
    console.log('Current nonce on chain:', currentNonce, 'Provided nonce:', nonce);
    
    if (parseInt(currentNonce) !== parseInt(nonce)) {
      return res.status(400).json({
        success: false,
        message: `Invalid nonce. Expected: ${currentNonce}, Got: ${nonce}`
      });
    }

    // Vote on blockchain with signature - GASLESS (server pays gas)
    console.log('🔄 Executing GASLESS on-chain vote...');
    const blockchainResult = await voteOnChain(
      poll.contractPollId, 
      optionIndex, 
      userWalletAddress, // User's wallet address as voter
      nonce,
      signature
    );

    if (!blockchainResult.success) {
      console.error('❌ Blockchain vote failed:', blockchainResult.error);
      return res.status(400).json({
        success: false,
        message: `On-chain voting failed: ${blockchainResult.error}`
      });
    }

    console.log('✅ GASLESS vote successful - transaction:', blockchainResult.transactionHash);

    // Update poll in database ONLY after successful blockchain vote
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    // Record vote with transaction hash
    await Vote.create({
  poll: id,
  user: userId,
  optionIndex,
  voterAddress: userWalletAddress,           // <-- add this
  transactionHash: blockchainResult.transactionHash
});

    const updatedPoll = await Poll.findById(id).populate('creator', 'username walletAddress');
    
    console.log('✅ Vote recorded successfully - GASLESS');
    
    res.json({
      success: true,
      message: 'Vote recorded successfully (gasless)',
      data: {
        poll: formatPollResponse(updatedPoll),
        transactionHash: blockchainResult.transactionHash
      }
    });
  } catch (error) {
    console.error('❌ Backend vote error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }
    
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