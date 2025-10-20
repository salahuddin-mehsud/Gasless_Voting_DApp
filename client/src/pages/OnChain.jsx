import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from '../components/layout/Navigation.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { BarChart3, Shield, Eye } from 'lucide-react';
import OnChainData from '../components/polls/OnChainData.jsx';

const OnChain = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view on-chain data.
            </p>
            <div className="space-y-3">
              <a href="/login" className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-center">
                Log In
              </a>
              <a href="/register" className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold text-center">
                Sign Up
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">On-Chain Verification</h1>
          <p className="text-gray-600 mt-2">
            View all polls and voting data directly from the blockchain - fully transparent and verifiable.
          </p>
        </div>

        {/* Navigation */}
        <Navigation className="mb-8" />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Fully Transparent</h3>
                  <p className="text-blue-700 text-sm">All data is publicly verifiable on the blockchain</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Real-Time Data</h3>
                  <p className="text-green-700 text-sm">Live results directly from smart contracts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">No Trust Required</h3>
                  <p className="text-purple-700 text-sm">Anyone can independently verify the results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* On-Chain Data Component */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
              Live Blockchain Data
            </h2>
            <p className="text-gray-600 mb-6">
              This data is read directly from the Ethereum blockchain. Every poll, vote, and result is stored on-chain and can be verified by anyone.
            </p>
            <OnChainData />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnChain;