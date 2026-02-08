// Billing domain types for frontend

export interface Wallet {
    id: string;
    organizationId: string;
    balance: number; // in cents
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletTransaction {
    id: string;
    organizationId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number; // in cents
    balanceBefore: number; // in cents
    balanceAfter: number; // in cents
    description: string;
    referenceId?: string;
    processedBy: string;
    createdAt: Date;
}

export interface WalletTransactionList {
    transactions: WalletTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface MeetingBillingRequest {
    organizationId: string;
    meetingId: string;
    durationSeconds: number;
    overrideBalanceCheck?: boolean;
}

export interface MeetingBillingResponse {
    meetingId: string;
    organizationId: string;
    durationSeconds: number;
    ratePerHour: number; // in cents
    totalCost: number; // in cents
    billingStatus: 'PENDING' | 'CHARGED' | 'BLOCKED' | 'FAILED';
    transactionId?: string;
    processedAt: Date;
    balanceBefore: number; // in cents
    balanceAfter: number; // in cents
}

export interface BillingCalculationRequest {
    organizationId: string;
    durationSeconds: number;
}

export interface BillingCalculationResponse {
    organizationId: string;
    durationSeconds: number;
    ratePerHour: number; // in cents
    totalCost: number; // in cents
    canAfford: boolean;
    currentBalance: number; // in cents
    balanceAfterCost: number; // in cents
}

export interface BillingRate {
    ratePerHour: number; // in cents
}

export interface CanStartMeetingResponse {
    canStart: boolean;
    estimatedMinutes: number;
}

// Query parameters for wallet transactions
export interface WalletTransactionQuery {
    page?: number;
    limit?: number;
    type?: 'CREDIT' | 'DEBIT';
    startDate?: Date;
    endDate?: Date;
}
