import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Vote, Calendar, CheckCircle } from 'lucide-react';
import Navigation from '../components/layout/Navigation.jsx';
import { formatDate } from '../utils/helpers.js';
import Loader from '../components/ui/Loader.jsx';
import Button from '../components/ui/Button.jsx';

const MyVotes = () => {
  const { user, token } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && token) {
      fetchMyVotes();
    }
  }, [user, token]);

  const fetchMyVotes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/votes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your votes');
      }

      const data = await response.json();
      
      if (data.success) {
        setVotes(data.data.votes);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your voting history.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <a href="/login">Log In</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/register">Sign Up</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Votes</h1>
          <p className="text-gray-600 mt-2">
            View your voting history and track your participation.
          </p>
        </div>

        {/* Navigation */}
        <Navigation className="mb-8" />

        {/* Content */}
        {error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error loading your votes: {error}</p>
              <Button onClick={fetchMyVotes} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : votes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No votes yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't voted on any polls yet. Start participating in the community!
              </p>
              <Button asChild>
                <a href="/polls">Browse Polls</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {votes.map((vote) => (
              <Card key={vote._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Poll Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {vote.poll?.question || 'Poll not available'}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Voted on {formatDate(vote.votedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Vote recorded</span>
                        </div>
                      </div>

                      {/* Your Vote */}
                      {vote.poll && vote.poll.options && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800 font-medium">
                            Your vote: <span className="font-semibold">{vote.poll.options[vote.optionIndex]?.text}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {vote.poll && (
                        <Button asChild size="sm">
                          <a href={`/poll/${vote.poll._id}`}>
                            View Poll
                          </a>
                        </Button>
                      )}
                      {vote.transactionHash && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.open(`https://sepolia.etherscan.io/tx/${vote.transactionHash}`, '_blank');
                          }}
                        >
                          View on Explorer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  {vote.transactionHash && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Transaction: <span className="font-mono">{vote.transactionHash}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVotes;