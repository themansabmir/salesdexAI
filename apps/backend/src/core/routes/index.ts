import { Router, Request, Response } from 'express';
import { authController, orgController, userController, systemController, billingController, knowledgeController, tokenService } from '@/container';
import { createAuthRouter } from '@/features/auth/auth.router';
import { createOrganizationRouter } from '@/features/organization/org.router';
import { createUserRouter } from '@/features/user/user.router';
import { createSystemRouter } from '@/features/system/system.router';
import { createBillingRouter } from '@/features/billing/billing.router';
import { createKnowledgeBaseRouter } from '@/features/knowledge-base/knowledge.router';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export const createMainRouter = (): Router => {
    const router = Router();

    // Health check
    router.get('/health', (req: Request, res: Response) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Feature routes
    router.use('/auth', createAuthRouter(authController, tokenService));
    router.use('/organizations', createOrganizationRouter(orgController, tokenService));
    router.use('/users', createUserRouter(userController, tokenService));
    router.use('/system', createSystemRouter(systemController, tokenService));
    router.use('/billing', createBillingRouter(billingController, tokenService));
    
    // Webhook secret should be from environment variables
    const webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret-change-in-production';
    router.use('/knowledge', createKnowledgeBaseRouter(knowledgeController, tokenService, webhookSecret));

    return router;
};
