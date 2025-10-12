import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GASLESS_VOTING_ABI } from '../utils/contractABI.js';
import { CONTRACT_ADDRESS } from '../utils/constants.js'; // Fixed import

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      
      // Get network
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 11155111n) { // Sepolia chain ID
        await switchToSepolia();
      }

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Initialize contract
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        GASLESS_VOTING_ABI,
        web3Signer
      );
      setContract(votingContract);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return { success: true };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to connect wallet' 
      };
    } finally {
      setLoading(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
      });
    } catch (error) {
      // If the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);

    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  const value = {
    provider,
    signer,
    account,
    contract,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};