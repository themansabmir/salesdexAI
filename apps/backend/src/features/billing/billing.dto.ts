import { z } from 'zod';
import { WalletTransactionType, BillingStatus, LowBalanceWarningLevel } from './billing.entity';

// Wallet response DTO
export const WalletResponseSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    balance: z.number(), // in cents
    currency: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type WalletResponse = z.infer<typeof WalletResponseSchema>;

// Wallet transaction response DTO
export const WalletTransactionResponseSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    type: z.enum([WalletTransactionType.CREDIT, WalletTransactionType.DEBIT]),
    amount: z.number(), // in cents
    balanceBefore: z.number(), // in cents
    balanceAfter: z.number(), // in cents
    description: z.string(),
    referenceId: z.string().optional(),
    processedBy: z.string(),
    createdAt: z.date(),
});

export type WalletTransactionResponse = z.infer<typeof WalletTransactionResponseSchema>;

// Wallet transaction query parameters
export const WalletTransactionQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    type: z.enum([WalletTransactionType.CREDIT, WalletTransactionType.DEBIT]).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export type WalletTransactionQuery = z.infer<typeof WalletTransactionQuerySchema>;

// Paginated wallet transactions response
export const WalletTransactionListResponseSchema = z.object({
    transactions: z.array(WalletTransactionResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});

export type WalletTransactionListResponse = z.infer<typeof WalletTransactionListResponseSchema>;

// Meeting billing request
export const MeetingBillingRequestSchema = z.object({
    meetingId: z.string().uuid(),
    organizationId: z.string().uuid(),
    durationSeconds: z.number().min(0),
    overrideBalanceCheck: z.boolean().default(false), // For super_admin override
});

export type MeetingBillingRequest = z.infer<typeof MeetingBillingRequestSchema>;

// Meeting billing response
export const MeetingBillingResponseSchema = z.object({
    meetingId: z.string(),
    organizationId: z.string(),
    durationSeconds: z.number(),
    ratePerHour: z.number(), // in cents
    totalCost: z.number(), // in cents
    billingStatus: z.enum([BillingStatus.PENDING, BillingStatus.CHARGED, BillingStatus.BLOCKED, BillingStatus.FAILED]),
    transactionId: z.string().optional(),
    processedAt: z.date(),
    balanceBefore: z.number(), // in cents
    balanceAfter: z.number(), // in cents
});

export type MeetingBillingResponse = z.infer<typeof MeetingBillingResponseSchema>;

// Billing calculation request
export const BillingCalculationRequestSchema = z.object({
    organizationId: z.string().uuid(),
    durationSeconds: z.number().min(0),
});

export type BillingCalculationRequest = z.infer<typeof BillingCalculationRequestSchema>;

// Billing calculation response
export const BillingCalculationResponseSchema = z.object({
    organizationId: z.string(),
    durationSeconds: z.number(),
    ratePerHour: z.number(), // in cents
    totalCost: z.number(), // in cents
    canAfford: z.boolean(),
    currentBalance: z.number(), // in cents
    balanceAfterCost: z.number(), // in cents
});

export type BillingCalculationResponse = z.infer<typeof BillingCalculationResponseSchema>;

// Low balance warning response
export const LowBalanceWarningResponseSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    level: z.enum([LowBalanceWarningLevel.EIGHTY_PERCENT, LowBalanceWarningLevel.NINETY_FIVE_PERCENT, LowBalanceWarningLevel.EXHAUSTED]),
    balanceBefore: z.number(), // in cents
    balanceThreshold: z.number(), // in cents
    triggeredAt: z.date(),
    emailSent: z.boolean(),
    emailSentAt: z.date().optional(),
});

export type LowBalanceWarningResponse = z.infer<typeof LowBalanceWarningResponseSchema>;
