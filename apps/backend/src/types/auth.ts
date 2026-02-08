import { Request } from 'express';

// JWT payload interface
export interface JWTPayload {
    sub: string; // User ID
    email: string;
    organizationId?: string;
    organizationRole?: string;
    platformRole?: string;
    iat: number;
    exp: number;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
    user: JWTPayload;
}
