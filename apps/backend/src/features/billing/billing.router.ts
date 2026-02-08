import { Router } from 'express';
import { BillingController } from './billing.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { ITokenService } from '@/core/ports/token.port';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export const createBillingRouter = (
    billingController: BillingController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);

    // All routes require authentication
    router.use(authMiddleware);

    // Wallet management routes
    router.get('/organizations/:orgId/wallet', billingController.getWallet);
    router.get('/organizations/:orgId/wallet/transactions', billingController.getWalletTransactions);

    // Billing calculation routes
    router.get('/rate', billingController.getBillingRate);
    router.post('/calculate', billingController.calculateMeetingCost);

    // Meeting billing routes
    router.post('/meetings/process-billing', billingController.processMeetingBilling);
    router.get('/organizations/:orgId/can-start-meeting', billingController.canStartMeeting);

    // Super admin only routes (for manual billing operations)
    router.use(requireRole('SUPER_ADMIN'));

    return router;
};
