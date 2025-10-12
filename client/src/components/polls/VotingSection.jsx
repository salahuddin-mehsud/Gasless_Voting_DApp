import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { usePolls } from '../../hooks/usePolls.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button.jsx';

const VotingSection = ({ poll, pollId, onVoteSuccess }) => { // Added pollId prop
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const { vote } = usePolls();
  const { isAuthenticated } = useAuth();

  // Use pollId from props if available, otherwise use poll._id
  const currentPollId = pollId || (poll ? poll._id : null);

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
      const result = await vote(currentPollId, selectedOption);
      
      if (result.success) {
        setSelectedOption(null);
        if (onVoteSuccess) {
          onVoteSuccess();
        }
      } else {
        alert(result.message || 'Failed to vote');
      }
    } catch (error) {
      alert('An error occurred while voting');
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
      <h3 className="text-lg font-semibold text-gray-900">Cast Your Vote</h3>
      
      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(index)}
            disabled={loading}
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
        disabled={selectedOption === null || loading}
        className="w-full"
      >
        Submit Vote
      </Button>

      {!isAuthenticated && (
        <p className="text-sm text-gray-500 text-center">
          You need to be logged in to vote
        </p>
      )}
    </div>
  );
};

export default VotingSection;