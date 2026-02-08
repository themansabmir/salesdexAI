import { Wallet, WalletTransaction, BillingCalculation, LowBalanceWarningEvent, LowBalanceWarningLevel } from './billing.entity';
import { WalletTransactionQuery, WalletTransactionListResponse } from './billing.dto';

// Repository interfaces following Clean Architecture
export interface IWalletRepository {
    findByOrganizationId(organizationId: string): Promise<Wallet | null>;
    updateBalance(organizationId: string, newBalance: number): Promise<Wallet>;
    createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction>;
    getTransactions(organizationId: string, query: WalletTransactionQuery): Promise<WalletTransactionListResponse>;
    getTransactionById(transactionId: string): Promise<WalletTransaction | null>;
}

export interface IBillingRepository {
    calculateBillingCost(organizationId: string, durationSeconds: number): Promise<number>;
    getCurrentRatePerHour(): Promise<number>; // in cents
    recordBillingCalculation(calculation: Omit<BillingCalculation, 'calculatedAt'>): Promise<BillingCalculation>;
    getBillingCalculations(organizationId: string, limit?: number): Promise<BillingCalculation[]>;
}

export interface ILowBalanceWarningRepository {
    createWarning(warning: Omit<LowBalanceWarningEvent, 'triggeredAt'>): Promise<LowBalanceWarningEvent>;
    getWarningsByOrganization(organizationId: string, limit?: number): Promise<LowBalanceWarningEvent[]>;
    markEmailSent(warningId: string): Promise<void>;
    hasRecentWarning(organizationId: string, level: LowBalanceWarningLevel, hours: number): Promise<boolean>;
}
