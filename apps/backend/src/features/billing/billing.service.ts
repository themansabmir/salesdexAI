import { 
    WalletTransactionType, 
    BillingStatus, 
    LowBalanceWarningLevel,
    Wallet,
    WalletTransaction,
    BillingCalculation,
    LowBalanceWarningEvent 
} from './billing.entity';
import { 
    WalletResponse,
    WalletTransactionListResponse,
    MeetingBillingRequest,
    MeetingBillingResponse,
    BillingCalculationRequest,
    BillingCalculationResponse
} from './billing.dto';
import { 
    IWalletRepository, 
    IBillingRepository, 
    ILowBalanceWarningRepository 
} from './billing.repository';
import { IOrganizationRepository } from '@/features/organization/org.repository';
import { ISystemConfigRepository } from '@/features/system/system.repository';
import { SYSTEM_CONFIG_KEYS } from '@/features/system/system.entity';
import { AuthenticatedRequest } from '@/types/auth';
import { DatabaseTransaction } from '@/lib/database/transaction';
import { WalletTransactionQuery } from './billing.dto';

export class BillingService {
    constructor(
        private readonly walletRepo: IWalletRepository,
        private readonly billingRepo: IBillingRepository,
        private readonly lowBalanceWarningRepo: ILowBalanceWarningRepository,
        private readonly orgRepo: IOrganizationRepository,
        private readonly systemConfigRepo: ISystemConfigRepository,
        private readonly dbTransaction: DatabaseTransaction,
    ) {}

    // Task_Bill_01: Create wallet retrieval API
    async getWallet(organizationId: string): Promise<WalletResponse> {
        const wallet = await this.walletRepo.findByOrganizationId(organizationId);
        if (!wallet) {
            throw new Error('Wallet not found for organization');
        }

        return this.mapWalletToResponse(wallet);
    }

    // Task_Bill_02: Create wallet transaction ledger API
    async getWalletTransactions(
        organizationId: string, 
        query: WalletTransactionQuery
    ): Promise<WalletTransactionListResponse> {
        return await this.walletRepo.getTransactions(organizationId, query);
    }

    // Task_Bill_03: Implement wallet credit logic
    async creditWallet(
        organizationId: string,
        amount: number, // in cents
        description: string,
        processedBy: string,
        referenceId?: string
    ): Promise<WalletTransaction> {
        if (amount <= 0) {
            throw new Error('Credit amount must be positive');
        }

        return await this.dbTransaction.execute(async (tx) => {
            // Get wallet within transaction
            const wallet = await this.walletRepo.findByOrganizationId(organizationId);
            if (!wallet) {
                throw new Error('Wallet not found for organization');
            }

            const balanceBefore = wallet.balance;
            const balanceAfter = balanceBefore + amount;

            // Update wallet balance
            await this.walletRepo.updateBalance(organizationId, balanceAfter);

            // Create transaction record
            const transaction = await this.walletRepo.createTransaction({
                organizationId,
                type: WalletTransactionType.CREDIT,
                amount,
                balanceBefore,
                balanceAfter,
                description,
                referenceId,
                processedBy,
            });

            return transaction;
        });
    }

    // Task_Bill_04 & Task_Bill_16: Implement wallet debit logic with negative balance prevention
    async debitWallet(
        organizationId: string,
        amount: number, // in cents
        description: string,
        processedBy: string,
        referenceId?: string,
        allowNegative: boolean = false // For super_admin override
    ): Promise<WalletTransaction> {
        if (amount <= 0) {
            throw new Error('Debit amount must be positive');
        }

        return await this.dbTransaction.execute(async (tx) => {
            // Get wallet within transaction
            const wallet = await this.walletRepo.findByOrganizationId(organizationId);
            if (!wallet) {
                throw new Error('Wallet not found for organization');
            }

            const balanceBefore = wallet.balance;

            // Task_Bill_16: Prevent negative wallet balances unless explicitly allowed
            if (!allowNegative && balanceBefore < amount) {
                throw new Error('Insufficient balance for debit');
            }

            const balanceAfter = balanceBefore - amount;

            // Update wallet balance
            await this.walletRepo.updateBalance(organizationId, balanceAfter);

            // Create transaction record
            const transaction = await this.walletRepo.createTransaction({
                organizationId,
                type: WalletTransactionType.DEBIT,
                amount,
                balanceBefore,
                balanceAfter,
                description,
                referenceId,
                processedBy,
            });

            // Check for low balance warnings (outside of transaction to avoid deadlocks)
            // This will be executed after the transaction commits
            setTimeout(() => {
                this.checkLowBalanceWarnings(organizationId, balanceAfter, processedBy)
                    .catch(error => {
                        console.error('Failed to check low balance warnings:', error);
                    });
            }, 0);

            return transaction;
        });
    }

    // Task_Bill_05: Implement billing rate resolver
    async getBillingRate(): Promise<number> {
        const rateConfig = await this.systemConfigRepo.findByKey(SYSTEM_CONFIG_KEYS.PRICING_PER_HOUR);
        return rateConfig ? Number(rateConfig.value) * 100 : 200; // Default $2/hour = 200 cents
    }

    // Task_Bill_06: Calculate meeting cost from duration
    async calculateMeetingCost(
        organizationId: string,
        durationSeconds: number
    ): Promise<BillingCalculationResponse> {
        if (durationSeconds < 0) {
            throw new Error('Duration cannot be negative');
        }

        const ratePerHour = await this.getBillingRate();
        const totalCost = Math.ceil((durationSeconds / 3600) * ratePerHour); // Round up to nearest cent
        
        const wallet = await this.walletRepo.findByOrganizationId(organizationId);
        const currentBalance = wallet?.balance || 0;
        const balanceAfterCost = currentBalance - totalCost;
        const canAfford = balanceAfterCost >= 0;

        return {
            organizationId,
            durationSeconds,
            ratePerHour,
            totalCost,
            canAfford,
            currentBalance,
            balanceAfterCost,
        };
    }

    // Task_Bill_07: Deduct balance on meeting completion
    async processMeetingBilling(request: MeetingBillingRequest, userId: string): Promise<MeetingBillingResponse> {
        const { meetingId, durationSeconds, overrideBalanceCheck } = request;

        // Get organization from meeting (this would come from meeting repository in real implementation)
        // For now, we'll require organizationId to be passed in the request or derived from meeting
        // TODO: Implement proper meeting repository lookup
        if (!request.organizationId) {
            throw new Error('Organization ID is required for meeting billing');
        }

        const organizationId = request.organizationId;

        // Verify organization exists
        const organization = await this.orgRepo.findById(organizationId);
        if (!organization) {
            throw new Error('Organization not found');
        }

        // Calculate cost
        const costCalculation = await this.calculateMeetingCost(organizationId, durationSeconds);
        
        // Check balance unless override is enabled (Task_Bill_11: super_admin override)
        if (!overrideBalanceCheck && !costCalculation.canAfford) {
            return {
                meetingId,
                organizationId,
                durationSeconds,
                ratePerHour: costCalculation.ratePerHour,
                totalCost: costCalculation.totalCost,
                billingStatus: BillingStatus.BLOCKED,
                processedAt: new Date(),
                balanceBefore: costCalculation.currentBalance,
                balanceAfter: costCalculation.currentBalance,
            };
        }

        try {
            // Process the debit
            const transaction = await this.debitWallet(
                organizationId,
                costCalculation.totalCost,
                `Meeting usage: ${durationSeconds}s (${Math.ceil(durationSeconds / 60)} minutes)`,
                userId,
                meetingId,
                overrideBalanceCheck // Allow negative if override is enabled
            );

            // Record billing calculation
            await this.billingRepo.recordBillingCalculation({
                organizationId,
                meetingId,
                durationSeconds,
                ratePerHour: costCalculation.ratePerHour,
                totalCost: costCalculation.totalCost,
            });

            return {
                meetingId,
                organizationId,
                durationSeconds,
                ratePerHour: costCalculation.ratePerHour,
                totalCost: costCalculation.totalCost,
                billingStatus: BillingStatus.CHARGED,
                transactionId: transaction.id,
                processedAt: new Date(),
                balanceBefore: transaction.balanceBefore,
                balanceAfter: transaction.balanceAfter,
            };
        } catch (error) {
            return {
                meetingId,
                organizationId,
                durationSeconds,
                ratePerHour: costCalculation.ratePerHour,
                totalCost: costCalculation.totalCost,
                billingStatus: BillingStatus.FAILED,
                processedAt: new Date(),
                balanceBefore: costCalculation.currentBalance,
                balanceAfter: costCalculation.currentBalance,
            };
        }
    }

    // Task_Bill_08: Implement hard stop billing guard
    async canStartMeeting(organizationId: string, estimatedDurationMinutes: number = 60): Promise<boolean> {
        const estimatedDurationSeconds = estimatedDurationMinutes * 60;
        const costCalculation = await this.calculateMeetingCost(organizationId, estimatedDurationSeconds);
        return costCalculation.canAfford;
    }

    // Task_Bill_12: Trigger low-balance warning events
    private async checkLowBalanceWarnings(
        organizationId: string,
        newBalance: number,
        triggeredBy: string
    ): Promise<void> {
        const ratePerHour = await this.getBillingRate();
        const hourlyCost = ratePerHour;
        
        // Check if we've already sent warnings recently (avoid spam)
        const eightyPercentWarningSent = await this.lowBalanceWarningRepo.hasRecentWarning(
            organizationId, 
            LowBalanceWarningLevel.EIGHTY_PERCENT, 
            24 // 24 hours
        );
        
        const ninetyFivePercentWarningSent = await this.lowBalanceWarningRepo.hasRecentWarning(
            organizationId, 
            LowBalanceWarningLevel.NINETY_FIVE_PERCENT, 
            24 // 24 hours
        );

        const exhaustedWarningSent = await this.lowBalanceWarningRepo.hasRecentWarning(
            organizationId, 
            LowBalanceWarningLevel.EXHAUSTED, 
            6 // 6 hours for exhausted warnings
        );

        // 80% warning (can afford less than 1 hour)
        if (!eightyPercentWarningSent && newBalance > 0 && newBalance < hourlyCost) {
            await this.lowBalanceWarningRepo.createWarning({
                organizationId,
                level: LowBalanceWarningLevel.EIGHTY_PERCENT,
                balanceBefore: newBalance,
                balanceThreshold: hourlyCost,
                emailSent: false,
            });
        }

        // 95% warning (can afford less than 5 minutes)
        const fiveMinuteCost = Math.ceil((5 / 60) * hourlyCost);
        if (!ninetyFivePercentWarningSent && newBalance > 0 && newBalance < fiveMinuteCost) {
            await this.lowBalanceWarningRepo.createWarning({
                organizationId,
                level: LowBalanceWarningLevel.NINETY_FIVE_PERCENT,
                balanceBefore: newBalance,
                balanceThreshold: fiveMinuteCost,
                emailSent: false,
            });
        }

        // Exhausted warning
        if (!exhaustedWarningSent && newBalance <= 0) {
            await this.lowBalanceWarningRepo.createWarning({
                organizationId,
                level: LowBalanceWarningLevel.EXHAUSTED,
                balanceBefore: newBalance,
                balanceThreshold: 0,
                emailSent: false,
            });
        }
    }

    // Helper methods for mapping entities to responses
    private mapWalletToResponse(wallet: Wallet): WalletResponse {
        return {
            id: wallet.id,
            organizationId: wallet.organizationId,
            balance: wallet.balance,
            currency: wallet.currency,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }
}
