import React from 'react';
import { Link } from 'react-router-dom';
import { User, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx';
import { formatDate, timeRemaining, calculatePercentage, formatAddress } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';

const PollCard = ({ poll, onVote, userVote }) => {
  const isActive = poll.isActive && new Date(poll.endTime) > new Date();
  const hasUserVoted = userVote !== null && userVote !== undefined;

  // Use poll._id for the link (MongoDB ID)
  const pollId = poll._id || poll.id;

  return (
    <Card className="hover:shadow-md transition-shadow fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {poll.question}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Active' : 'Ended'}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{formatAddress(poll.creator?.walletAddress)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{isActive ? timeRemaining(poll.endTime) : formatDate(poll.endTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>{poll.totalVotes} votes</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const percentage = calculatePercentage(option.votes, poll.totalVotes);
            const isUserVote = hasUserVoted && userVote === index;
            
            return (
              <div
                key={index} 
                className={`relative p-3 rounded-lg border transition-colors ${
                  isUserVote
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* ... existing option content ... */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${
                    isUserVote ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                  <span className={`text-sm ${
                    isUserVote ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {option.votes} ({percentage}%)
                  </span>
                </div>
                
                {poll.totalVotes > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isUserVote ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
                
                {isUserVote && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Your vote
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t">
        <Link to={`/poll/${pollId}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        
        {isActive && !hasUserVoted && (
          <Link to={`/poll/${pollId}`}>
            <Button size="sm">
              Vote Now
            </Button>
          </Link>
        )}
        
        {isActive && hasUserVoted && (
          <span className="text-sm text-green-600 font-medium">
            ✓ You've voted
          </span>
        )}
        
        {!isActive && (
          <span className="text-sm text-gray-500">
            Poll ended
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default PollCard;