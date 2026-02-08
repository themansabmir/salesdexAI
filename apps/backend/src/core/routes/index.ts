import { Router, Request, Response } from 'express';
import { authController, orgController, userController, systemController, tokenService } from '@/container';
import { createAuthRouter } from '@/features/auth/auth.router';
import { createOrganizationRouter } from '@/features/organization/org.router';
import { createUserRouter } from '@/features/user/user.router';
import { createSystemRouter } from '@/features/system/system.router';
import { requireRole } from '../middleware/role-guard.middleware';

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

    return router;
};
