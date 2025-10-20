import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ALCHEMY_API_KEY } from '../../utils/constants.js';
import { Card, CardContent } from '../ui/Card.jsx';
import Loader from '../ui/Loader.jsx';
import { BarChart3 } from 'lucide-react';

const OnChainData = () => {
  const [onChainPolls, setOnChainPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contract ABI - include all view functions
  const contractABI = [
    "function pollCount() external view returns (uint256)",
    "function getPoll(uint256 _pollId) external view returns (string, string[], address, uint256, bool, uint256)",
    "function getPollResults(uint256 _pollId) external view returns (uint256[])",
    "function getUserPolls(address _user) external view returns (uint256[])",
    "function hasVoted(uint256, address) external view returns (bool)"
  ];

  useEffect(() => {
    fetchOnChainData();
  }, []);

  const fetchOnChainData = async () => {
    try {
      // Check if environment variables are available
      if (!ALCHEMY_API_KEY) {
        throw new Error('Alchemy API key not found in environment variables');
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not found in environment variables');
      }

      console.log('Using Contract Address:', CONTRACT_ADDRESS);

      // Construct Alchemy RPC URL
      const alchemyRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
      
      // FIX: Use ethers.providers for v5 compatibility
      const provider = new ethers.providers.JsonRpcProvider(alchemyRpcUrl);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      // Get total poll count
      const count = await contract.pollCount();
      const pollCount = parseInt(count.toString());
      console.log('Total polls on chain:', pollCount);

      const polls = [];
      
      // Fetch each poll's details
      for (let i = 0; i < pollCount; i++) {
        try {
          const pollData = await contract.getPoll(i);
          const results = await contract.getPollResults(i);
          
          polls.push({
            id: i,
            question: pollData[0],
            options: pollData[1],
            creator: pollData[2],
            endTime: new Date(parseInt(pollData[3].toString()) * 1000),
            isActive: pollData[4],
            totalVotes: pollData[5].toString(),
            results: results.map(r => r.toString())
          });
        } catch (error) {
          console.log(`Poll ${i} might not exist:`, error.message);
        }
      }

      setOnChainPolls(polls);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching on-chain data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader size="md" />
        <p className="text-gray-600 mt-2">Loading on-chain data from blockchain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading On-Chain Data</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchOnChainData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>Make sure your environment variables are set:</p>
          <p>VITE_CONTRACT_ADDRESS: {CONTRACT_ADDRESS || 'Not set'}</p>
          <p>VITE_ALCHEMY_API_KEY: {ALCHEMY_API_KEY ? '***' + ALCHEMY_API_KEY.slice(-4) : 'Not set'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {onChainPolls.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No polls on chain yet
            </h3>
            <p className="text-gray-600">
              Create your first poll to see it here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {onChainPolls.map(poll => (
            <Card key={poll.id} className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 flex-1">
                    {poll.question}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    poll.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {poll.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div className="space-y-1">
                    <p><strong>Creator:</strong> {formatAddress(poll.creator)}</p>
                    <p><strong>Total Votes:</strong> {poll.totalVotes}</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Ends:</strong> {poll.endTime.toLocaleString()}</p>
                    <p><strong>Poll ID:</strong> {poll.id}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <strong className="text-gray-700">Live Results:</strong>
                  <div className="mt-2 space-y-2">
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-800">{option}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{poll.results[index] || 0} votes</span>
                          {poll.totalVotes > 0 && (
                            <span className="text-gray-600 text-sm ml-2">
                              ({Math.round(((poll.results[index] || 0) / parseInt(poll.totalVotes)) * 100)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-center">
                    🔗 This data is live from the blockchain - fully transparent and verifiable
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnChainData;