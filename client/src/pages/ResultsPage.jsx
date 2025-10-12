import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { User, Clock, BarChart3, CheckCircle } from 'lucide-react';
import ResultsChart from '../components/polls/ResultsChart.jsx';
import VotingSection from '../components/polls/VotingSection.jsx';
import { formatDate, timeRemaining, formatAddress } from '../utils/helpers.js';
import Loader from '../components/ui/Loader.jsx';
import Button from '../components/ui/Button.jsx';

const ResultsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (id && id !== 'undefined') {
      fetchPoll();
    } else {
      setError('Invalid poll ID');
      setLoading(false);
    }
  }, [id]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPoll(data.data.poll);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    fetchPoll(); // Refresh poll data after voting
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Poll Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'The poll you are looking for does not exist.'}
            </p>
            <Button asChild>
              <a href="/polls">Browse Polls</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = poll.isActive && new Date(poll.endTime) > new Date();
  const hasUserVoted = poll.userVote !== null && poll.userVote !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poll Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {poll.question}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>By {formatAddress(poll.creator?.walletAddress)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {isActive ? timeRemaining(poll.endTime) : `Ended ${formatDate(poll.endTime)}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>{poll.totalVotes} total votes</span>
                  </div>
                  {hasUserVoted && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>You've voted</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? 'Active' : 'Ended'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voting Section */}
          {isActive && (
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <VotingSection 
                    poll={poll}
                    pollId={id} // Pass the poll ID explicitly
                    onVoteSuccess={handleVoteSuccess}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          <div className={isActive ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {poll.totalVotes > 0 ? (
                  <ResultsChart poll={poll} />
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No votes yet
                    </h3>
                    <p className="text-gray-600">
                      {isActive 
                        ? 'Be the first to cast your vote!' 
                        : 'This poll ended with no votes.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Results */}
            {poll.totalVotes > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">
                            {option.text}
                          </span>
                          {hasUserVoted && poll.userVote === index && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Your vote
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {option.votes} votes
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((option.votes / poll.totalVotes) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;