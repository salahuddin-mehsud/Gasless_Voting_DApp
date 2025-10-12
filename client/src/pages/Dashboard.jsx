import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserPolls } from '../hooks/usePolls.js';
import { useWeb3 } from '../contexts/Web3Context.jsx';
import PollCard from '../components/polls/PollCard.jsx';
import Navigation from '../components/layout/Navigation.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Users, BarChart3, Clock, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const { account, isConnected } = useWeb3();
  const { polls, loading, error, pagination } = useUserPolls();
  
  const stats = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      label: 'Total Polls',
      value: polls.length
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Total Votes',
      value: polls.reduce((sum, poll) => sum + poll.totalVotes, 0)
    },
    {
      icon: <Clock className="h-6 w-6" />,
      label: 'Active Polls',
      value: polls.filter(poll => poll.isActive && new Date(poll.endTime) > new Date()).length
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: 'Avg. Votes',
      value: polls.length > 0 ? Math.round(polls.reduce((sum, poll) => sum + poll.totalVotes, 0) / polls.length) : 0
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.username}! Here's an overview of your polls.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <Navigation className="mb-8" />

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-800">
                    Connect your wallet to create polls and vote gaslessly using Account Abstraction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Polls</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error loading your polls: {error}</p>
            </CardContent>
          </Card>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No polls created yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first poll to engage with your community.
              </p>
              <Button asChild>
                <a href="/create">Create Your First Poll</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
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
      </div>

      </div>
    </div>
  );
};

export default Dashboard;