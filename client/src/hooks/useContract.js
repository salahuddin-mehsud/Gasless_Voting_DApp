import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context.jsx';

export const useContract = () => {
  const { contract, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const createPoll = async (question, options, durationInMinutes) => {
    if (!contract || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.createPoll(question, options, durationInMinutes);
      const receipt = await tx.wait();
      return { success: true, receipt };
    } catch (error) {
      console.error('Error creating poll:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const vote = async (pollId, optionIndex) => {
    if (!contract || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.vote(pollId, optionIndex);
      const receipt = await tx.wait();
      return { success: true, receipt };
    } catch (error) {
      console.error('Error voting:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getPoll = async (pollId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const poll = await contract.getPoll(pollId);
      return {
        question: poll[0],
        options: poll[1],
        creator: poll[2],
        endTime: poll[3].toString(),
        isActive: poll[4],
        totalVotes: poll[5].toString()
      };
    } catch (error) {
      console.error('Error getting poll:', error);
      throw error;
    }
  };

  const hasVoted = async (pollId, address = account) => {
    if (!contract || !address) {
      return false;
    }

    try {
      return await contract.hasVoted(pollId, address);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  return {
    loading,
    createPoll,
    vote,
    getPoll,
    hasVoted,
    isConnected: !!contract && isConnected,
  };
};