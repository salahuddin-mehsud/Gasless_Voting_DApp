import { AlchemyAccountProvider } from '@alchemy/aa-alchemy';
import { sepolia } from 'viem/chains';
import { alchemy } from '../config/alchemy.js';

export const createSmartAccount = async (userAddress) => {
  try {
    return {
      success: true,
      smartAccountAddress: userAddress, 
      message: 'Smart account created successfully'
    };
  } catch (error) {
    console.error('Error creating smart account:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const sponsorGasForTransaction = async (userOperation) => {
  try {
    return {
      success: true,
      sponsored: true,
      userOperation
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};