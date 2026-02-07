import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from '@/config';
import { createMainRouter } from '@/core/routes';
import { errorHandler, requestLogger } from '@/core/middleware';

export const createApp = () :Express=> {
    const app = express();

    // Middleware
    app.use(helmet());
    app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(requestLogger);

    // Routes
    app.use('/api/v1', createMainRouter());

    // Error handling
    app.use(errorHandler);

    return app;
};
