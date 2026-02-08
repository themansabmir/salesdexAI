import { useState } from 'react';
import { useCreditWallet, useDebitWallet } from '@/features/system/application/use-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Minus } from 'lucide-react';
import { ChangeEvent } from 'react';

export function WalletAdjuster({ orgId, orgName }: { orgId: string; orgName: string }) {
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const creditWallet = useCreditWallet();
    const debitWallet = useDebitWallet();

    const handleCredit = async () => {
        if (!amount || !reason) {
            toast.error('Please enter amount and reason');
            return;
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid positive amount');
            return;
        }
        
        try {
            await creditWallet.mutateAsync({
                orgId,
                data: {
                    amount: amountNum,
                    reason,
                },
            });
            toast.success(`$${amountNum} credited to ${orgName}`);
            setAmount('');
            setReason('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to credit wallet');
        }
    };

    const handleDebit = async () => {
        if (!amount || !reason) {
            toast.error('Please enter amount and reason');
            return;
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid positive amount');
            return;
        }
        
        try {
            await debitWallet.mutateAsync({
                orgId,
                data: {
                    amount: amountNum,
                    reason,
                },
            });
            toast.success(`$${amountNum} debited from ${orgName}`);
            setAmount('');
            setReason('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to debit wallet');
        }
    };

    const isPending = creditWallet.isPending || debitWallet.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manual Wallet Adjustment</CardTitle>
                <CardDescription>Credit or debit {orgName} wallet</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="reason">Reason</Label>
                        <textarea
                            id="reason"
                            className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter reason for adjustment..."
                            value={reason}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleCredit}
                            disabled={isPending}
                            className="flex-1"
                        >
                            {creditWallet.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Credit
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleDebit}
                            disabled={isPending}
                            variant="destructive"
                            className="flex-1"
                        >
                            {debitWallet.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Minus className="h-4 w-4 mr-2" />
                                    Debit
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
