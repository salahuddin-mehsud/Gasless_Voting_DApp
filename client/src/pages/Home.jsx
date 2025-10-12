import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Zap, Users, Shield } from 'lucide-react';
import { usePolls } from '../hooks/usePolls.js';
import PollCard from '../components/polls/PollCard.jsx';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

const Home = () => {
  const { polls, loading, error } = usePolls('active', 1, 6);

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: 'Gasless Voting',
      description: 'Vote without paying gas fees using Account Abstraction technology.'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: 'Secure & Transparent',
      description: 'Every vote is recorded on the blockchain for complete transparency and security.'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Community Driven',
      description: 'Create polls for your community, DAO, or organization with ease.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Vote className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Vote Without
              <span className="block text-blue-200">Gas Fees</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience the future of decentralized voting with Account Abstraction. 
              Create polls, vote gaslessly, and build stronger communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/polls">
                <Button size="lg" variant="secondary">
                  Explore Polls
                </Button>
              </Link>
              <Link to="/create">
                <Button size="lg">
                  Create Poll
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Gasless Vote?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're making decentralized voting accessible to everyone by eliminating the barriers of gas fees and complex wallet setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Polls Section */}
         <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ... existing header ... */}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading polls: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.slice(0, 6).map((poll) => (
                <PollCard 
                  key={poll._id} 
                  poll={poll}
                  onVote={(poll) => {
                    window.location.href = `/poll/${poll._id}`;
                  }}
                />
              ))}
            </div>
          )}

          {/* ... existing empty state ... */}
        </div>
      </section>

    </div>
  );
};

export default Home;