import React, { useRef, useState } from 'react';

import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';

const FileStorage = () => {
  const {
    contract,
    account,
    balance,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnect,
  } = useWeb3();

  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [txHash, setTxHash] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Calculate file hash using Web Crypto API
  const calculateFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      try {
        const hash = await calculateFileHash(file);
        setFileHash(hash);
      } catch (err) {
        console.error('Error calculating hash:', err);
        alert('Error calculating file hash');
      }
    }
  };

  // Store file hash on blockchain
  const storeFileHash = async () => {
    if (!contract || !fileHash || !fileName) {
      alert('Please select a file first');
      return;
    }

    setIsTransactionLoading(true);
    setTxHash('');

    try {
      // Adjust method name based on your contract
      const tx = await contract.uploadFile(fileName, fileHash, 'dummy_ipfsCid');
      setTxHash(tx.hash);

      console.log('Transaction sent:', tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction mined:', receipt);

      alert('File hash stored successfully on Sepolia!');

      // Clear form
      setFileHash('');
      setFileName('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Transaction error:', err);
      let errorMessage = 'Transaction failed: ';

      if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += 'Insufficient funds for gas';
      } else if (err.code === 'USER_REJECTED') {
        errorMessage += 'Transaction rejected by user';
      } else {
        errorMessage += err.message;
      }

      alert(errorMessage);
    } finally {
      setIsTransactionLoading(false);
    }
  };

  // Verify file hash
  const verifyFile = async () => {
    if (!contract || !fileHash) {
      alert('Please enter a file hash or select a file');
      return;
    }

    try {
      // Adjust method name based on your contract
      const isValid = await contract.verifyFile(fileHash);
      const result = isValid
        ? 'File is valid and exists on blockchain!'
        : 'File not found or invalid!';
      setVerificationResult(result);
      alert(result);
    } catch (err) {
      console.error('Verify error:', err);
      alert('Verification failed: ' + err.message);
    }
  };

  // Get shortened address for display
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className='container'>
        <h2>Secure File Storage on Sepolia</h2>
        <div className='network-info'>
          <p>🔗 Network: Sepolia Testnet</p>
          <p>⚡ Chain ID: 11155111</p>
        </div>
        {error && <div className='error'>{error}</div>}
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className='connect-btn'
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask Wallet'}
        </button>
        <div className='info-box'>
          <h4>ℹ️ Before connecting:</h4>
          <ul>
            <li>Make sure you have MetaMask installed</li>
            <li>Switch to Sepolia testnet</li>
            <li>Get test ETH from a Sepolia faucet</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='wallet-info'>
        <div>
          <p>
            <strong>Connected:</strong> {shortenAddress(account)}
          </p>
          <p>
            <strong>Balance:</strong> {parseFloat(balance).toFixed(4)} SEP ETH
          </p>
          <p>
            <strong>Network:</strong> Sepolia Testnet
          </p>
        </div>
        <button onClick={disconnect} className='disconnect-btn'>
          Disconnect
        </button>
      </div>

      <h2>🔒 Secure File Storage</h2>

      <div className='form-section'>
        <h3>📁 Store File Hash</h3>
        <div className='file-upload'>
          <input
            ref={fileInputRef}
            type='file'
            onChange={handleFileSelect}
            className='file-input'
          />
          <p className='file-info'>
            {selectedFile
              ? `Selected: ${selectedFile.name}`
              : 'No file selected'}
          </p>
        </div>

        <input
          type='text'
          placeholder='File Name'
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className='input-field'
        />

        <textarea
          placeholder='File Hash (SHA-256)'
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          className='hash-field'
          rows='3'
        />

        <button
          onClick={storeFileHash}
          disabled={isTransactionLoading || !fileHash || !fileName}
          className='action-btn'
        >
          {isTransactionLoading
            ? '⏳ Storing on Blockchain...'
            : '💾 Store File Hash'}
        </button>
      </div>

      <div className='form-section'>
        <h3>🔍 Verify File Integrity</h3>
        <textarea
          placeholder='File Hash to Verify'
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          className='hash-field'
          rows='3'
        />
        <button
          onClick={verifyFile}
          disabled={!fileHash}
          className='action-btn verify-btn'
        >
          ✅ Verify File
        </button>

        {verificationResult && (
          <div
            className={`verification-result ${
              verificationResult.includes('valid') ? 'success' : 'failure'
            }`}
          >
            {verificationResult}
          </div>
        )}
      </div>

      {txHash && (
        <div className='transaction-info'>
          <h4>📋 Transaction Details</h4>
          <p>
            <strong>Hash:</strong>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='tx-link'
            >
              {txHash}
            </a>
          </p>
          <p>
            <small>Click to view on Sepolia Etherscan</small>
          </p>
        </div>
      )}

      <div className='info-section'>
        <h4>ℹ️ How it works:</h4>
        <ol>
          <li>Select a file to automatically calculate its SHA-256 hash</li>
          <li>Store the hash on Sepolia blockchain (requires gas fee)</li>
          <li>
            Verify file integrity by checking if hash exists on blockchain
          </li>
          <li>All transactions are recorded on Sepolia testnet</li>
        </ol>
      </div>
    </div>
  );
};

export default FileStorage;
