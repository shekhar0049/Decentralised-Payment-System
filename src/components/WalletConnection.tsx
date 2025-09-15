import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, WifiOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionProps {
  onWalletConnect: (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, address: string) => void;
  onWalletDisconnect: () => void;
}

export function WalletConnection({ onWalletConnect, onWalletDisconnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const { toast } = useToast();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const userBalance = await provider.getBalance(userAddress);

      setIsConnected(true);
      setAddress(userAddress);
      setBalance(ethers.formatEther(userBalance));
      
      onWalletConnect(provider, signer, userAddress);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    onWalletDisconnect();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  if (isConnected) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">Wallet Connected</p>
                <p className="text-sm text-muted-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <p className="text-sm text-success">
                  Balance: {parseFloat(balance).toFixed(4)} ETH
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectWallet}
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your MetaMask wallet to start sending payments
            </p>
          </div>
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="glow-button w-full"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}