import { Router, Request, Response } from 'express';
import { authController } from '@/container';
import { createAuthRouter } from '@/features/auth/auth.router';

export const createMainRouter = (): Router => {
    const router = Router();

    // Health check
    router.get('/health', (req: Request, res: Response) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Feature routes
    router.use('/auth', createAuthRouter(authController));

    return router;
};
