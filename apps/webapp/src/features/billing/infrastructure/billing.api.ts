import { apiClient } from '@/lib/api-client';
import {
    Wallet,
    WalletTransactionList,
    BillingRate,
    BillingCalculationRequest,
    BillingCalculationResponse,
    MeetingBillingRequest,
    MeetingBillingResponse,
    CanStartMeetingResponse,
    WalletTransactionQuery,
} from '../domain/billing.types';

// Wallet APIs
export const getWalletApi = async (orgId: string): Promise<Wallet> => {
    return apiClient.get<Wallet>(`/billing/organizations/${orgId}/wallet`);
};

export const getWalletTransactionsApi = async (
    orgId: string,
    query?: WalletTransactionQuery
): Promise<WalletTransactionList> => {
    return apiClient.get<WalletTransactionList>(`/billing/organizations/${orgId}/wallet/transactions`, {
        params: query,
    });
};

// Billing rate APIs
export const getBillingRateApi = async (): Promise<BillingRate> => {
    return apiClient.get<BillingRate>('/billing/rate');
};

// Billing calculation APIs
export const calculateMeetingCostApi = async (
    data: BillingCalculationRequest
): Promise<BillingCalculationResponse> => {
    return apiClient.post<BillingCalculationResponse>('/billing/calculate', data);
};

// Meeting billing APIs
export const processMeetingBillingApi = async (
    data: MeetingBillingRequest
): Promise<MeetingBillingResponse> => {
    return apiClient.post<MeetingBillingResponse>('/billing/meetings/process-billing', data);
};

export const canStartMeetingApi = async (
    orgId: string,
    estimatedMinutes?: number
): Promise<CanStartMeetingResponse> => {
    return apiClient.get<CanStartMeetingResponse>(`/billing/organizations/${orgId}/can-start-meeting`, {
        params: { estimatedMinutes },
    });
};
