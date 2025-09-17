// Contract configuration for Sepolia testnet
export const CONTRACT_CONFIG = {
  address: '0x2D1FB38A63dF7f9e0Fe55beCE97F2981C32febCB', // Replace with your actual deployed address
  chainId: 11155111, // Sepolia testnet
  chainName: 'Sepolia Test Network',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // You can use public RPC or your Alchemy URL
  blockExplorerUrl: 'https://sepolia.etherscan.io/',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
};

// Your contract ABI - you'll need to copy this from your compiled contract
export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
    ],
    name: 'FileDeleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sharedWith',
        type: 'address',
      },
    ],
    name: 'FileShared',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'filename',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'ipfsCid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'uploader',
        type: 'address',
      },
    ],
    name: 'FileUploaded',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
    ],
    name: 'deleteFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'shareFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'filename',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'ipfsCid',
        type: 'string',
      },
    ],
    name: 'uploadFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileHash',
        type: 'string',
      },
    ],
    name: 'verifyFile',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
