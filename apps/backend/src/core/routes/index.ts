import { Router } from 'express';

export const createMainRouter = () => {
    const router = Router();

    // Health check
    router.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Feature routes will be attached here
    // router.use('/auth', authRouter);

    return router;
};
