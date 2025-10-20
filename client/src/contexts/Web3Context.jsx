import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GASLESS_VOTING_ABI } from '../utils/contractABI.js';
import { CONTRACT_ADDRESS } from '../utils/constants.js';

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
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);


  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          // initialize provider/signer/contract silently with the already connected account
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const web3Signer = web3Provider.getSigner();
          const votingContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            GASLESS_VOTING_ABI,
            web3Signer
          );

          // network check: if not Sepolia, attempt to switch
          const network = await web3Provider.getNetwork();
          if (network.chainId !== 11155111) {
            // don't force user here, but attempt to switch programmatically
            try {
              await switchToSepolia();
            } catch (e) {
              console.warn('Unable to switch to Sepolia automatically', e);
            }
          }

          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(accounts[0]);
          setContract(votingContract);
          setIsConnected(true);

          // attach listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
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

      // Force MetaMask to show account selection popup
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permErr) {
        // Some MetaMask versions might reject or not support; fall back to eth_requestAccounts
        console.warn('wallet_requestPermissions failed or not supported, falling back', permErr);
      }

      // Now request accounts (this opens the account picker if permissions allowed)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned by MetaMask');
      }

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();

      // Network check and switch if needed
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 11155111) {
        await switchToSepolia();
      }

      // Initialize contract using signer
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        GASLESS_VOTING_ABI,
        web3Signer
      );

      // Save state
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setContract(votingContract);
      setIsConnected(true);

      // Attach listeners (if not already attached)
      if (window.ethereum && !window.ethereum._web3ctx_listening) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum._web3ctx_listening = true;
      }

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
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                rpcUrls: ['https://sepolia.infura.io/v3/'], // user should provide key if needed
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addErr) {
          console.warn('Failed to add Sepolia chain to MetaMask', addErr);
          throw addErr;
        }
      } else {
        throw error;
      }
    }
  };

  const handleAccountsChanged = async (accounts) => {
    try {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        GASLESS_VOTING_ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setContract(votingContract);
      setIsConnected(true);

      console.log('Accounts changed, now using', accounts[0]);
    } catch (err) {
      console.error('Error in handleAccountsChanged:', err);
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
      try {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum._web3ctx_listening = false;
      } catch (e) {

      }
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
