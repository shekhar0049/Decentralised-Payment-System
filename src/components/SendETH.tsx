import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendETHProps {
  signer: ethers.JsonRpcSigner | null;
  contractAddress: string;
  contractABI: any[];
}

export function SendETH({ signer, contractAddress, contractABI }: SendETHProps) {
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

  const handleSendETH = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer || !contractAddress) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAddress(recipient)) {
      toast({
        title: "Invalid Address",
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
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.sendEther(recipient, { value: amountWei });
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      await tx.wait();
      
      toast({
        title: "ETH Sent Successfully!",
        description: `${amount} ETH sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      });

      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.reason || error.message || "Failed to send ETH",
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
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Send className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>Send ETH</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendETH} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eth-recipient">Recipient Address</Label>
            <Input
              id="eth-recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input-glow bg-input border-border/50"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="eth-amount">Amount (ETH)</Label>
            <Input
              id="eth-amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-glow bg-input border-border/50"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="glow-button w-full"
            disabled={isLoading || !signer}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send ETH
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}