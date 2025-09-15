import { useState } from 'react';
import { ethers } from 'ethers';
import { WalletConnection } from '@/components/WalletConnection';
import { SendETH } from '@/components/SendETH';
import { SendToken } from '@/components/SendToken';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Shield, Zap, Globe } from 'lucide-react';

// Contract ABI for the payment contract
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "sendEther",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "EtherSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokenSent",
    "type": "event"
  }
];

// You'll need to replace this with your deployed contract address
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

const Index = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  const handleWalletConnect = (
    walletProvider: ethers.BrowserProvider,
    walletSigner: ethers.JsonRpcSigner,
    address: string
  ) => {
    setProvider(walletProvider);
    setSigner(walletSigner);
    setUserAddress(address);
  };

  const handleWalletDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="absolute inset-0 opacity-50">
          <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0.5px,transparent_0.5px)] bg-[size:60px_60px] opacity-20" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Decentralized Payment System</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Send Payments
              <br />
              <span className="text-4xl md:text-6xl">Across the Globe</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Send ETH and ERC-20 tokens securely using smart contracts. 
              Fast, decentralized, and transparent payments powered by blockchain technology.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-success" />
                <span>Secure Smart Contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-warning" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-accent" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 space-y-8">
        {/* Wallet Connection */}
        <div className="max-w-md mx-auto">
          <WalletConnection 
            onWalletConnect={handleWalletConnect}
            onWalletDisconnect={handleWalletDisconnect}
          />
        </div>

        {/* Payment Forms */}
        {userAddress && (
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <SendETH 
              signer={signer}
              contractAddress={CONTRACT_ADDRESS}
              contractABI={CONTRACT_ABI}
            />
            <SendToken 
              signer={signer}
              contractAddress={CONTRACT_ADDRESS}
              contractABI={CONTRACT_ABI}
            />
          </div>
        )}

        {/* Transaction History */}
        {userAddress && (
          <div className="max-w-2xl mx-auto">
            <TransactionHistory 
              provider={provider}
              contractAddress={CONTRACT_ADDRESS}
              userAddress={userAddress}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-16">
          <h2 className="text-2xl font-bold text-primary">Get Started</h2>
          <p className="text-muted-foreground">
            To use this payment system, you'll need to deploy the smart contract and update the CONTRACT_ADDRESS variable.
            Connect your MetaMask wallet and start sending secure payments on the blockchain.
          </p>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-warning text-sm">
            <strong>Note:</strong> Remember to replace CONTRACT_ADDRESS with your deployed contract address
            and ensure you're connected to the correct network (Sepolia testnet recommended for testing).
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
