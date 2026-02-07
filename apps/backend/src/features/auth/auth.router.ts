import { Router } from 'express';
import { AuthController } from './auth.controller';

export const createAuthRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', authController.register);
    router.get('/me', authController.getMe);

    return router;
};
