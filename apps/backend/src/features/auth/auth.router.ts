import { Router } from 'express';
import { AuthController } from './auth.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { ITokenService } from '@/core/ports/token.port';

export const createAuthRouter = (
    authController: AuthController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);

    router.post('/login', authController.login);
    router.post('/register', authController.register);
    router.get('/me', authMiddleware, authController.getMe);

    return router;
};
