import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendTokenProps {
  signer: ethers.JsonRpcSigner | null;
  contractAddress: string;
  contractABI: any[];
}

export function SendToken({ signer, contractAddress, contractABI }: SendTokenProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isValidAddress = (address: string) => {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer || !contractAddress) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!tokenAddress || !recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAddress(tokenAddress)) {
      toast({
        title: "Invalid Token Address",
        description: "Please enter a valid token contract address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAddress(recipient)) {
      toast({
        title: "Invalid Recipient Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // For most ERC-20 tokens, we need to handle decimals properly
      // This is a simplified version - in production, you'd want to fetch the token decimals
      const tokenAmount = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      
      const tx = await contract.sendERC20(tokenAddress, recipient, tokenAmount);
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      await tx.wait();
      
      toast({
        title: "Token Sent Successfully!",
        description: `${amount} tokens sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      });

      setTokenAddress('');
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.reason || error.message || "Failed to send token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-accent rounded-lg">
            <Coins className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>Send ERC-20 Token</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendToken} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-address">Token Contract Address</Label>
            <Input
              id="token-address"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="input-glow bg-input border-border/50"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token-recipient">Recipient Address</Label>
            <Input
              id="token-recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input-glow bg-input border-border/50"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token-amount">Amount</Label>
            <Input
              id="token-amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-glow bg-input border-border/50"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="glow-button w-full bg-gradient-accent"
            disabled={isLoading || !signer}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Send Token
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}