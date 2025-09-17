import { CONTRACT_ABI, CONTRACT_CONFIG } from '../contract/config';
import { useCallback, useEffect, useState } from 'react';

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('0');

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      const ethereumProvider = await detectEthereumProvider();
      if (ethereumProvider) {
        const web3Provider = new ethers.BrowserProvider(ethereumProvider);
        setProvider(web3Provider);
      } else {
        setError('Please install MetaMask!');
      }
    };
    initProvider();
  }, []);

  // Get account balance
  const getBalance = useCallback(
    async (address) => {
      if (!provider || !address) return;
      try {
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (err) {
        console.error('Balance fetch error:', err);
      }
    },
    [provider]
  );

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!provider) return;

    setIsLoading(true);
    setError('');

    try {
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) throw new Error('No accounts found');

      // Get signer
      const web3Signer = await provider.getSigner();
      setSigner(web3Signer);
      setAccount(accounts[0]);

      // Get balance
      await getBalance(accounts[0]);

      // Check if we're on the correct network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CONTRACT_CONFIG.chainId) {
        await switchNetwork();
      }

      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_ABI,
        web3Signer
      );
      setContract(contractInstance);
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [provider, getBalance]);

  // Switch to Sepolia network
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}`,
                chainName: CONTRACT_CONFIG.chainName,
                rpcUrls: [CONTRACT_CONFIG.rpcUrl],
                blockExplorerUrls: [CONTRACT_CONFIG.blockExplorerUrl],
                nativeCurrency: CONTRACT_CONFIG.nativeCurrency,
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        throw new Error('Please switch to Sepolia network manually');
      }
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setError('');
    setBalance('0');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          await getBalance(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, getBalance]);

  return {
    provider,
    signer,
    contract,
    account,
    balance,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnect,
    switchNetwork,
  };
};
