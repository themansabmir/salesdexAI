import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWalletApi,
    getWalletTransactionsApi,
    getBillingRateApi,
    calculateMeetingCostApi,
    processMeetingBillingApi,
    canStartMeetingApi,
} from '../infrastructure/billing.api';
import {
    WalletTransactionQuery,
    BillingCalculationRequest,
    MeetingBillingRequest,
} from '../domain/billing.types';

// Query keys
const billingKeys = {
    all: ['billing'] as const,
    wallet: (orgId: string) => ['billing', 'wallet', orgId] as const,
    transactions: (orgId: string, query?: WalletTransactionQuery) => 
        ['billing', 'transactions', orgId, query] as const,
    rate: ['billing', 'rate'] as const,
    canStartMeeting: (orgId: string, minutes?: number) => 
        ['billing', 'canStart', orgId, minutes] as const,
};

// Wallet hooks
export const useWallet = (orgId: string) => {
    return useQuery({
        queryKey: billingKeys.wallet(orgId),
        queryFn: () => getWalletApi(orgId),
        enabled: !!orgId,
        staleTime: 30 * 1000, // 30 seconds
    });
};

export const useWalletTransactions = (orgId: string, query?: WalletTransactionQuery) => {
    return useQuery({
        queryKey: billingKeys.transactions(orgId, query),
        queryFn: () => getWalletTransactionsApi(orgId, query),
        enabled: !!orgId,
        staleTime: 60 * 1000, // 1 minute
    });
};

// Billing rate hooks
export const useBillingRate = () => {
    return useQuery({
        queryKey: billingKeys.rate,
        queryFn: getBillingRateApi,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Billing calculation hooks
export const useCalculateMeetingCost = () => {
    return useMutation({
        mutationFn: (data: BillingCalculationRequest) => calculateMeetingCostApi(data),
    });
};

// Meeting billing hooks
export const useProcessMeetingBilling = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: MeetingBillingRequest) => processMeetingBillingApi(data),
        onSuccess: (_, variables) => {
            // Invalidate wallet cache for the organization
            queryClient.invalidateQueries({ 
                queryKey: billingKeys.wallet(variables.organizationId || '') 
            });
            // Invalidate transactions cache
            queryClient.invalidateQueries({ 
                queryKey: billingKeys.transactions(variables.organizationId || '') 
            });
        },
    });
};

// Meeting eligibility hooks
export const useCanStartMeeting = (orgId: string, estimatedMinutes?: number) => {
    return useQuery({
        queryKey: billingKeys.canStartMeeting(orgId, estimatedMinutes),
        queryFn: () => canStartMeetingApi(orgId, estimatedMinutes),
        enabled: !!orgId,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
};
