import { ethers } from 'ethers';
import { alchemy } from '../config/alchemy.js';

let contractInstance = null;

export const getContract = () => {
  if (contractInstance) return contractInstance;

  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractABI = [
    "function createPoll(string _question, string[] _options, uint256 _durationInMinutes) external returns (uint256)",
    "function vote(uint256 _pollId, uint256 _option) external",
    "function getPoll(uint256 _pollId) external view returns (string, string[], address, uint256, bool, uint256)",
    "function getVotes(uint256 _pollId, uint256 _option) external view returns (uint256)",
    "function getPollResults(uint256 _pollId) external view returns (uint256[])",
    "function getUserPolls(address _user) external view returns (uint256[])",
    "function endPoll(uint256 _pollId) external",
    "function extendPoll(uint256 _pollId, uint256 _additionalMinutes) external",
    "function pollCount() external view returns (uint256)",
    "function hasVoted(uint256, address) external view returns (bool)",
    "event PollCreated(uint256 pollId, string question, address creator, uint256 endTime)",
    "event Voted(uint256 pollId, address voter, uint256 option)",
    "event PollEnded(uint256 pollId)"
  ];

  contractInstance = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
  );

  return contractInstance;
};

export const createPollOnChain = async (question, options, durationInMinutes) => {
  try {
    const contract = getContract();
    const tx = await contract.createPoll(question, options, durationInMinutes);
    const receipt = await tx.wait();
    
    // Extract poll ID from event
    let pollId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'PollCreated') {
          pollId = parsedLog.args.pollId.toString();
          break;
        }
      } catch (e) {
        // Continue checking other logs
      }
    }

    return {
      success: true,
      pollId,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error creating poll on chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const voteOnChain = async (pollId, optionIndex, voterAddress) => {
  try {
    const contract = getContract();
    
    // Check if already voted
    const hasVoted = await contract.hasVoted(pollId, voterAddress);
    if (hasVoted) {
      return {
        success: false,
        error: 'Already voted on this poll'
      };
    }

    console.log(`Voting on chain: pollId=${pollId}, optionIndex=${optionIndex}, voter=${voterAddress}`);
    
    const tx = await contract.vote(pollId, optionIndex);
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error voting on chain:', error);
    return {
      success: false,
      error: error.message || 'Blockchain transaction failed'
    };
  }
};

export const getPollFromChain = async (pollId) => {
  try {
    const contract = getContract();
    const poll = await contract.getPoll(pollId);
    
    return {
      success: true,
      poll: {
        question: poll[0],
        options: poll[1],
        creator: poll[2],
        endTime: poll[3].toString(),
        isActive: poll[4],
        totalVotes: poll[5].toString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};