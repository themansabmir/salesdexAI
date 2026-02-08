import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { WalletBalanceCard } from '../components/wallet-balance-card';
import { WalletTransactionListComponent } from '../components/wallet-transaction-list';
import { useWallet, useWalletTransactions, useBillingRate } from '../../application/use-billing';
import { WalletTransactionQuery } from '../../domain/billing.types';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useUser } from '@/features/auth/application/use-user';

export function BillingDashboardPage() {
    const { data: user } = useUser();
    const [transactionQuery, setTransactionQuery] = useState<WalletTransactionQuery>({
        page: 1,
        limit: 20,
    });

    // Get organization ID from user context
    const organizationId = user?.organizationId;

    const {
        data: wallet,
        isLoading: isWalletLoading,
    } = useWallet(organizationId || '');

    const {
        data: transactions,
        isLoading: isTransactionsLoading,
    } = useWalletTransactions(organizationId || '', transactionQuery);

    const {
        data: billingRate,
    } = useBillingRate();

    const handleLoadMoreTransactions = (query: WalletTransactionQuery) => {
        setTransactionQuery(query);
    };

    if (!organizationId) {
        return (
            <div className="container mx-auto py-8">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You need to be part of an organization to view billing information.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const balanceInDollars = wallet ? wallet.balance / 100 : 0;
    const ratePerHourDollars = billingRate ? billingRate.ratePerHour / 100 : 0;
    const isLowBalance = balanceInDollars < 5;
    const isZeroBalance = balanceInDollars === 0;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Billing Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor your wallet balance, transaction history, and usage costs.
                </p>
            </div>

            {/* Alerts */}
            {isZeroBalance && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Your wallet balance is exhausted. Add funds to continue using AI analysis features.
                    </AlertDescription>
                </Alert>
            )}

            {isLowBalance && !isZeroBalance && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Your wallet balance is running low. Consider adding funds to avoid service interruption.
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {/* Wallet Balance */}
                <WalletBalanceCard 
                    wallet={wallet!} 
                    isLoading={isWalletLoading} 
                />

                {/* Billing Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Rate
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                ${ratePerHourDollars.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per hour of analysis
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Estimated Hours Remaining */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Hours Remaining
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                {ratePerHourDollars > 0 
                                    ? Math.floor(balanceInDollars / ratePerHourDollars)
                                    : 0
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                at current rate
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            This Month
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                $0.00
                            </div>
                            <p className="text-xs text-muted-foreground">
                                total spent
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <WalletTransactionListComponent
                        transactions={transactions!}
                        isLoading={isTransactionsLoading}
                        onLoadMore={handleLoadMoreTransactions}
                    />
                </TabsContent>

                <TabsContent value="usage">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Usage analytics will be available once you start using the service.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
