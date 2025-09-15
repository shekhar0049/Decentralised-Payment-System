import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  hash: string;
  type: 'ETH' | 'Token';
  to: string;
  amount: string;
  timestamp: number;
}

interface TransactionHistoryProps {
  provider: ethers.BrowserProvider | null;
  contractAddress: string;
  userAddress: string;
}

export function TransactionHistory({ provider, contractAddress, userAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!provider || !contractAddress || !userAddress) return;

    setIsLoading(true);
    try {
      // This is a simplified example - in production, you'd want to use a proper indexing service
      // For now, we'll just show some placeholder data
      const mockTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          type: 'ETH',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          amount: '0.5',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef12',
          type: 'Token',
          to: '0x1234567890abcdef1234567890abcdef12345678',
          amount: '100',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [provider, contractAddress, userAddress]);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const openInExplorer = (hash: string) => {
    // This would open in Etherscan or similar - using Sepolia testnet for example
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-accent/20 rounded-lg">
              <History className="h-5 w-5 text-accent" />
            </div>
            <span>Transaction History</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="border-accent/20 hover:bg-accent/10"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant={tx.type === 'ETH' ? 'default' : 'secondary'}
                      className={tx.type === 'ETH' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}
                    >
                      {tx.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {tx.amount} {tx.type === 'ETH' ? 'ETH' : 'Tokens'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(tx.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openInExplorer(tx.hash)}
                  className="text-accent hover:bg-accent/10"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}