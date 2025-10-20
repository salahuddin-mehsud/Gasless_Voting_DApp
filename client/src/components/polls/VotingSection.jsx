import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { usePolls } from '../../hooks/usePolls.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const VotingSection = ({ poll, pollId, onVoteSuccess }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contractStatus, setContractStatus] = useState('checking');
  const { vote } = usePolls();
  const { isAuthenticated, user } = useAuth();

  const currentPollId = pollId || (poll ? poll._id : null);

  // Check contract existence
  const checkContractExists = async () => {
  try {
    let provider;
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      // optional: prompt connect so Web3Provider works
      await provider.send('eth_requestAccounts', []);
    } else if (import.meta.env.VITE_ALCHEMY_KEY) {
      const url = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`;
      provider = new ethers.providers.JsonRpcProvider(url);
    } else {
      console.error('No provider available: install MetaMask or set VITE_ALCHEMY_KEY');
      setContractStatus('error');
      return false;
    }

    const code = await provider.getCode(CONTRACT_ADDRESS);
    const exists = code && code !== '0x' && code !== '0x0' && code !== '0x00';
    setContractStatus(exists ? 'found' : 'not_found');
    return exists;
  } catch (error) {
    console.error('Error checking contract:', error);
    setContractStatus('error');
    return false;
  }
};


  useEffect(() => {
    checkContractExists();
  }, []);

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option to vote');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    if (!currentPollId) {
      alert('Invalid poll ID');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 STARTING GASLESS VOTE PROCESS...');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to vote');
      }

      // Get user's current MetaMask account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const currentAddress = await signer.getAddress();

      console.log('👤 Current MetaMask address:', currentAddress);
      console.log('👤 User wallet in database:', user.walletAddress);

      // Check if user is using the correct wallet
      if (currentAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new Error(`Please switch to your registered wallet: ${user.walletAddress}`);
      }

      // Check contract
      const contractExists = await checkContractExists();
      if (!contractExists) {
        throw new Error('Contract not found on blockchain');
      }

      console.log('✅ All checks passed! Proceeding with GASLESS vote...');

      // Get nonce from contract for THIS USER
      const contractABI = [
        "function nonces(address) external view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      let nonce;
      try {
        nonce = await contract.nonces(user.walletAddress);
        console.log('🔢 Got nonce for user:', nonce.toString());
      } catch (error) {
        console.error('❌ Error getting nonce:', error);
        nonce = ethers.BigNumber.from(0);
      }

      // Generate signature with user's wallet address
      console.log('✍️ Generating signature for gasless voting...');

      const messageHash = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256', 'address', 'uint256', 'address'],
        [poll.contractPollId, selectedOption, user.walletAddress, nonce, CONTRACT_ADDRESS]
      );
      
      console.log('📝 Message hash:', messageHash);

      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
      console.log('✅ Generated signature:', signature);

      // Send to backend for GASLESS execution
      console.log('📤 Sending vote to backend for GASLESS execution...');
      
      const result = await vote(currentPollId, selectedOption, signature, nonce.toString());
      
      console.log('📨 Backend response:', result);

      if (result.success) {
        setSelectedOption(null);
        if (onVoteSuccess) {
          onVoteSuccess();
        }
        alert('✅ Vote submitted successfully (GASLESS)!');
      } else {
        alert(result.message || 'Failed to vote');
      }
    } catch (error) {
      console.error('❌ Voting error:', error);
      alert(error.message || 'Voting failed');
    } finally {
      setLoading(false);
    }
  };

  if (!poll || !poll.isActive || new Date(poll.endTime) <= new Date()) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-700 font-medium">This poll has ended</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contract Status */}
      <div className={`text-sm text-center p-2 rounded ${
        contractStatus === 'found' ? 'bg-green-100 text-green-800' :
        contractStatus === 'not_found' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {contractStatus === 'found' && '✅ Contract connected'}
        {contractStatus === 'not_found' && '❌ Contract not found'}
        {contractStatus === 'checking' && '⏳ Checking contract...'}
        {contractStatus === 'error' && '⚠️ Error checking contract'}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Cast Your Vote</h3>
      
      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(index)}
            disabled={loading || contractStatus !== 'found'}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedOption === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option.text}</span>
              {selectedOption === index && (
                <Check className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleVote}
        loading={loading}
        disabled={selectedOption === null || loading || contractStatus !== 'found'}
        className="w-full"
      >
        {contractStatus === 'found' ? 'Submit Vote (Gasless)' : 'Checking Contract...'}
      </Button>

      {!isAuthenticated && (
        <p className="text-sm text-gray-500 text-center">
          You need to be logged in to vote
        </p>
      )}

      <div className="text-xs text-gray-500 text-center">
        <div>Gas fees paid by server - You vote for free!</div>
      </div>
    </div>
  );
};

export default VotingSection;