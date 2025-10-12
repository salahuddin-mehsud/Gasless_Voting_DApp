import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import CreatePoll from '../components/polls/CreatePoll.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const CreatePollPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSuccess = (result) => {
    // Use the poll ID from the result data
    if (result && result.poll && result.poll.id) {
      navigate(`/poll/${result.poll.id}`);
    } else {
      console.error('Poll ID not found in response:', result);
      navigate('/polls'); // Fallback to polls page
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to create a poll.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Poll
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create a gasless voting poll for your community. Your poll will be stored on the blockchain for complete transparency.
            </p>
          </div>
        </div>

        {/* Create Poll Form */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePoll onSuccess={handleSuccess} />
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                🚀 Gasless Voting
              </h3>
              <p className="text-gray-600 text-sm">
                Voters won't need to pay gas fees thanks to Account Abstraction technology.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                🔒 Secure & Transparent
              </h3>
              <p className="text-gray-600 text-sm">
                Every vote is recorded on the blockchain, ensuring complete transparency and security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePollPage;