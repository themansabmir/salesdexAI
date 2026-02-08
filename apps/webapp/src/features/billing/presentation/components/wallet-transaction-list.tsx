import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { WalletTransactionList, WalletTransactionQuery } from '../../domain/billing.types';
import { WalletTransaction } from '../../domain/billing.types';
import { ArrowUpIcon, ArrowDownIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface WalletTransactionListProps {
    transactions: WalletTransactionList;
    isLoading?: boolean;
    onLoadMore?: (query: WalletTransactionQuery) => void;
}

export function WalletTransactionListComponent({ 
    transactions, 
    isLoading,
    onLoadMore 
}: WalletTransactionListProps) {
    const [filter, setFilter] = useState<WalletTransactionQuery>({});

    const handleFilterChange = (key: keyof WalletTransactionQuery, value: any) => {
        const newFilter = { ...filter, [key]: value };
        setFilter(newFilter);
        onLoadMore?.(newFilter);
    };

    const formatAmount = (amount: number) => {
        return (amount / 100).toFixed(2);
    };

    const formatDate = (date: Date) => {
        return format(new Date(date), 'MMM dd, yyyy HH:mm');
    };

    const getTransactionIcon = (type: string) => {
        return type === 'CREDIT' ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
        ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
        );
    };

    const getTransactionColor = (type: string) => {
        return type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Transaction History</span>
                    <div className="text-sm text-muted-foreground">
                        {transactions.pagination.total} transactions
                    </div>
                </CardTitle>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="type-filter" className="text-sm">Type:</Label>
                        <Select
                            value={filter.type || ''}
                            onValueChange={(value) => 
                                handleFilterChange('type', value === '' ? undefined : value)
                            }
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                <SelectItem value="CREDIT">Credit</SelectItem>
                                <SelectItem value="DEBIT">Debit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent>
                {isLoading && transactions.transactions.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded">
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : transactions.transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.transactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                formatAmount={formatAmount}
                                formatDate={formatDate}
                                getTransactionIcon={getTransactionIcon}
                                getTransactionColor={getTransactionColor}
                            />
                        ))}
                        
                        {/* Load More */}
                        {transactions.pagination.page < transactions.pagination.totalPages && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handleFilterChange('page', transactions.pagination.page + 1)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface TransactionItemProps {
    transaction: WalletTransaction;
    formatAmount: (amount: number) => string;
    formatDate: (date: Date) => string;
    getTransactionIcon: (type: string) => React.ReactNode;
    getTransactionColor: (type: string) => string;
}

function TransactionItem({
    transaction,
    formatAmount,
    formatDate,
    getTransactionIcon,
    getTransactionColor,
}: TransactionItemProps) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type)}
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                    </p>
                </div>
            </div>
            
            <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'CREDIT' ? '+' : '-'}${formatAmount(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Balance: ${formatAmount(transaction.balanceAfter)}
                </p>
            </div>
        </div>
    );
}
