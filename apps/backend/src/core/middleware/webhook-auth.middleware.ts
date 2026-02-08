import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware for webhook authentication using signature verification
 */
export const createWebhookAuthMiddleware = (secret: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const signature = req.headers['x-webhook-signature'] as string;
            const timestamp = req.headers['x-webhook-timestamp'] as string;
            
            if (!signature || !timestamp) {
                const authHeader = (req.headers['authorization'] as string | undefined) ?? '';
                const hmacMatch = authHeader.match(/hmac\s+secret=(.+)/i);
                if (hmacMatch && hmacMatch[1] === secret) {
                    return next();
                }
                console.warn('[webhook-auth] Missing headers', {
                    signature: Boolean(signature),
                    timestamp: Boolean(timestamp),
                    receivedHeaders: req.headers,
                });
                return res.status(401).json({ 
                    message: 'Missing webhook authentication headers' 
                });
            }

            // Check timestamp to prevent replay attacks (5 minute window)
            const webhookTime = parseInt(timestamp);
            const currentTime = Date.now();
            const timeDiff = Math.abs(currentTime - webhookTime);
            
            if (timeDiff > 5 * 60 * 1000) { // 5 minutes
                return res.status(401).json({ 
                    message: 'Webhook timestamp expired' 
                });
            }

            // Verify signature
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(`${timestamp}.${payload}`)
                .digest('hex');

            if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                console.warn('[webhook-auth] Signature mismatch', {
                    signature,
                    expectedSignature,
                    body: req.body,
                });
                return res.status(401).json({ 
                    message: 'Invalid webhook signature' 
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({ 
                message: 'Webhook authentication failed' 
            });
        }
    };
};
