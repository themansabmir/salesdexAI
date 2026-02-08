// Billing domain entities

export const WalletTransactionType = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
} as const;

export type WalletTransactionType = typeof WalletTransactionType[keyof typeof WalletTransactionType];

export const BillingStatus = {
    PENDING: 'PENDING',
    CHARGED: 'CHARGED',
    BLOCKED: 'BLOCKED',
    FAILED: 'FAILED',
} as const;

export type BillingStatus = typeof BillingStatus[keyof typeof BillingStatus];

export const LowBalanceWarningLevel = {
    EIGHTY_PERCENT: 'EIGHTY_PERCENT',
    NINETY_FIVE_PERCENT: 'NINETY_FIVE_PERCENT',
    EXHAUSTED: 'EXHAUSTED',
} as const;

export type LowBalanceWarningLevel = typeof LowBalanceWarningLevel[keyof typeof LowBalanceWarningLevel];

// Wallet entity
export interface Wallet {
    id: string;
    organizationId: string;
    balance: number; // in cents
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

// Wallet transaction entity
export interface WalletTransaction {
    id: string;
    organizationId: string;
    type: WalletTransactionType;
    amount: number; // in cents, always positive
    balanceBefore: number; // in cents
    balanceAfter: number; // in cents
    description: string;
    referenceId?: string; // Optional reference to meeting ID or other entity
    processedBy: string; // User ID who processed the transaction
    createdAt: Date;
}

// Billing calculation entity
export interface BillingCalculation {
    organizationId: string;
    meetingId: string;
    durationSeconds: number;
    ratePerHour: number; // in cents
    totalCost: number; // in cents
    calculatedAt: Date;
}

// Low balance warning event
export interface LowBalanceWarningEvent {
    organizationId: string;
    level: LowBalanceWarningLevel;
    balanceBefore: number; // in cents
    balanceThreshold: number; // in cents
    triggeredAt: Date;
    emailSent: boolean;
    emailSentAt?: Date;
}
