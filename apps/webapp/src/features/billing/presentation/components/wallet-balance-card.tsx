import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Wallet } from '../../domain/billing.types';
import { DollarSign } from 'lucide-react';

interface WalletBalanceCardProps {
    wallet: Wallet;
    isLoading?: boolean;
}

export function WalletBalanceCard({ wallet, isLoading }: WalletBalanceCardProps) {
    const balanceInDollars = wallet.balance / 100;
    const isLowBalance = balanceInDollars < 5; // Less than $5
    const isZeroBalance = balanceInDollars === 0;

    const getBalanceVariant = () => {
        if (isZeroBalance) return 'destructive';
        if (isLowBalance) return 'secondary';
        return 'default';
    };

    const getBalanceText = () => {
        if (isZeroBalance) return 'Balance Exhausted';
        if (isLowBalance) return 'Low Balance';
        return 'Available Balance';
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Wallet Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Wallet Balance
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-2xl font-bold">
                        ${balanceInDollars.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant={getBalanceVariant()}>
                            {getBalanceText()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {wallet.currency}
                        </span>
                    </div>
                    {isLowBalance && (
                        <div className="text-xs text-muted-foreground mt-2">
                            Add funds to continue using AI analysis features
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
