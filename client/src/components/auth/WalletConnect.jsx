import React from 'react';
import { Wallet } from 'lucide-react';
import { useWeb3 } from '../../contexts/Web3Context.jsx';
import { formatAddress } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';

const WalletConnect = () => {
  const { account, connectWallet, disconnectWallet, isConnected, loading } = useWeb3();

  const handleConnect = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </p>
            <p className="text-sm text-gray-500">
              {isConnected ? formatAddress(account) : 'Connect your wallet to vote'}
            </p>
          </div>
        </div>
        
        <Button
          variant={isConnected ? "outline" : "primary"}
          size="sm"
          onClick={handleConnect}
          loading={loading}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </div>
  );
};

export default WalletConnect;