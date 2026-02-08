import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service';
import {
    WalletTransactionQuerySchema,
    MeetingBillingRequestSchema,
    BillingCalculationRequestSchema,
} from './billing.dto';
import { AuthenticatedRequest } from '@/types/auth';

export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    // Task_Bill_01: Create wallet retrieval API
    getWallet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            
            const wallet = await this.billingService.getWallet(orgId);
            res.json(wallet);
        } catch (error) {
            next(error);
        }
    };

    // Task_Bill_02: Create wallet transaction ledger API
    getWalletTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const query = WalletTransactionQuerySchema.parse(req.query);
            
            const transactions = await this.billingService.getWalletTransactions(orgId, query);
            res.json(transactions);
        } catch (error) {
            next(error);
        }
    };

    // Task_Bill_05: Get current billing rate
    getBillingRate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rate = await this.billingService.getBillingRate();
            res.json({ ratePerHour: rate }); // in cents
        } catch (error) {
            next(error);
        }
    };

    // Task_Bill_06: Calculate meeting cost
    calculateMeetingCost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const data = BillingCalculationRequestSchema.parse(req.body);
            
            const calculation = await this.billingService.calculateMeetingCost(
                data.organizationId,
                data.durationSeconds
            );
            res.json(calculation);
        } catch (error) {
            next(error);
        }
    };

    // Task_Bill_07: Process meeting billing
    processMeetingBilling = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const data = MeetingBillingRequestSchema.parse(req.body);
            
            const billing = await this.billingService.processMeetingBilling(data, userId);
            res.json(billing);
        } catch (error) {
            next(error);
        }
    };

    // Task_Bill_08: Check if organization can start meeting
    canStartMeeting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const estimatedMinutes = parseInt(req.query.estimatedMinutes as string) || 60;
            
            const canStart = await this.billingService.canStartMeeting(orgId, estimatedMinutes);
            res.json({ canStart, estimatedMinutes });
        } catch (error) {
            next(error);
        }
    };
}
