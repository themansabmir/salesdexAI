import { Router } from 'express';
import { UserController } from './user.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { requireRole } from '@/core/middleware/role-guard.middleware';
import { ITokenService } from '@/core/ports/token.port';

export const createUserRouter = (
    userController: UserController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);

    router.use(authMiddleware);

    // Only SUPER_ADMIN can manage users directly via these endpoints for now
    // Or allow MANAGER to view? Let's restrict to SUPER_ADMIN for role updates.

    router.get('/', requireRole('SUPER_ADMIN'), userController.list);
    router.get('/:id', requireRole('SUPER_ADMIN'), userController.get);
    router.patch('/:id/role', requireRole('SUPER_ADMIN'), userController.updateRole);

    return router;
};
