import { PrismaClient } from '@prisma/client';
import {
    IWalletRepository,
    IBillingRepository,
    ILowBalanceWarningRepository,
} from '@/features/billing/billing.repository';
import { WalletTransactionQuery, WalletTransactionListResponse } from '@/features/billing/billing.dto';
import { 
    Wallet, 
    WalletTransaction, 
    BillingCalculation, 
    LowBalanceWarningEvent,
    LowBalanceWarningLevel,
    WalletTransactionType 
} from '@/features/billing/billing.entity';

export class PrismaWalletRepository implements IWalletRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByOrganizationId(organizationId: string): Promise<Wallet | null> {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                walletBalance: true,
                currency: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!org) {
            return null;
        }

        return this.mapToWallet(org);
    }

    async updateBalance(organizationId: string, newBalance: number): Promise<Wallet> {
        const org = await this.prisma.organization.update({
            where: { id: organizationId },
            data: { walletBalance: newBalance },
            select: {
                id: true,
                walletBalance: true,
                currency: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return this.mapToWallet(org);
    }

    async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
        const created = await this.prisma.billingTransaction.create({
            data: {
                organizationId: transaction.organizationId,
                type: transaction.type,
                amount: transaction.amount,
                balanceBefore: transaction.balanceBefore,
                balanceAfter: transaction.balanceAfter,
                description: transaction.description,
                processedBy: transaction.processedBy,
            },
        });

        return this.mapToTransaction(created);
    }

    async getTransactions(organizationId: string, query: WalletTransactionQuery): Promise<WalletTransactionListResponse> {
        const { page, limit, type, startDate, endDate } = query;
        const skip = (page - 1) * limit;

        const where = {
            organizationId,
            ...(type && { type }),
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
        };

        const [transactions, total] = await Promise.all([
            this.prisma.billingTransaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.billingTransaction.count({ where }),
        ]);

        return {
            transactions: transactions.map(t => this.mapToTransaction(t)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTransactionById(transactionId: string): Promise<WalletTransaction | null> {
        const transaction = await this.prisma.billingTransaction.findUnique({
            where: { id: transactionId },
        });

        return transaction ? this.mapToTransaction(transaction) : null;
    }

    private mapToWallet(org: any): Wallet {
        return {
            id: org.id,
            organizationId: org.id,
            balance: Number(org.walletBalance),
            currency: org.currency,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
        };
    }

    private mapToTransaction(transaction: any): WalletTransaction {
        return {
            id: transaction.id,
            organizationId: transaction.organizationId,
            type: transaction.type as WalletTransactionType,
            amount: Number(transaction.amount),
            balanceBefore: Number(transaction.balanceBefore),
            balanceAfter: Number(transaction.balanceAfter),
            description: transaction.description,
            referenceId: transaction.referenceId || undefined,
            processedBy: transaction.processedBy,
            createdAt: transaction.createdAt,
        };
    }
}

export class PrismaBillingRepository implements IBillingRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async calculateBillingCost(organizationId: string, durationSeconds: number): Promise<number> {
        // Get current rate from system config
        const rateConfig = await this.prisma.systemConfig.findUnique({
            where: { key: 'PRICING_PER_HOUR' },
        });

        const ratePerHour = rateConfig ? Number(rateConfig.value) * 100 : 200; // Default $2/hour in cents
        return Math.ceil((durationSeconds / 3600) * ratePerHour);
    }

    async getCurrentRatePerHour(): Promise<number> {
        const rateConfig = await this.prisma.systemConfig.findUnique({
            where: { key: 'PRICING_PER_HOUR' },
        });

        return rateConfig ? Number(rateConfig.value) * 100 : 200; // Default $2/hour in cents
    }

    async recordBillingCalculation(calculation: Omit<BillingCalculation, 'calculatedAt'>): Promise<BillingCalculation> {
        // This would be stored in a billing_calculations table if it existed
        // For now, we'll return a mock calculation without id since entity doesn't have it
        return {
            organizationId: calculation.organizationId,
            meetingId: calculation.meetingId,
            durationSeconds: calculation.durationSeconds,
            ratePerHour: calculation.ratePerHour,
            totalCost: calculation.totalCost,
            calculatedAt: new Date(),
        };
    }

    async getBillingCalculations(organizationId: string, limit?: number): Promise<BillingCalculation[]> {
        // This would query from billing_calculations table
        // For now, return empty array as this table doesn't exist yet
        return [];
    }
}

export class PrismaLowBalanceWarningRepository implements ILowBalanceWarningRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createWarning(warning: Omit<LowBalanceWarningEvent, 'triggeredAt'>): Promise<LowBalanceWarningEvent> {
        // This would be stored in a low_balance_warnings table
        // For now, we'll return a mock warning without id since entity doesn't have it
        return {
            organizationId: warning.organizationId,
            level: warning.level,
            balanceBefore: warning.balanceBefore,
            balanceThreshold: warning.balanceThreshold,
            triggeredAt: new Date(),
            emailSent: warning.emailSent,
            emailSentAt: warning.emailSentAt,
        };
    }

    async getWarningsByOrganization(organizationId: string, limit?: number): Promise<LowBalanceWarningEvent[]> {
        // This would query from low_balance_warnings table
        // For now, return empty array as this table doesn't exist yet
        return [];
    }

    async markEmailSent(warningId: string): Promise<void> {
        // This would update the email_sent flag in the database
        // For now, this is a no-op as the table doesn't exist yet
    }

    async hasRecentWarning(organizationId: string, level: LowBalanceWarningLevel, hours: number): Promise<boolean> {
        // This would check if there's a recent warning in the database
        // For now, return false as the table doesn't exist yet
        return false;
    }
}
