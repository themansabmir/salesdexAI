import { Router } from 'express';
import { KnowledgeBaseController } from './knowledge.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { createWebhookAuthMiddleware } from '@/core/middleware/webhook-auth.middleware';
import { ITokenService } from '@/core/ports/token.port';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export const createKnowledgeBaseRouter = (
    knowledgeController: KnowledgeBaseController,
    tokenService: ITokenService,
    webhookSecret: string
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);
    const webhookAuthMiddleware = createWebhookAuthMiddleware(webhookSecret);

    // All routes require authentication
    router.use(authMiddleware);

    // Document management routes - Admin only for write operations
    router.post('/organizations/:orgId/documents/upload', requireRole('ADMIN'), knowledgeController.initiateUpload);
    router.post('/documents/upload/confirm', webhookAuthMiddleware, knowledgeController.confirmUpload); // Webhook endpoint
    router.get('/organizations/:orgId/documents', knowledgeController.listDocuments); // Read access for all
    router.get('/organizations/:orgId/documents/:documentId/download', knowledgeController.getDownloadUrl); // Read access for all
    router.delete('/organizations/:orgId/documents/:documentId', requireRole('ADMIN'), knowledgeController.deleteDocument);

    // Competitor management routes - Admin only for write operations
    router.post('/organizations/:orgId/competitors', requireRole('ADMIN'), knowledgeController.createCompetitor);
    router.put('/organizations/:orgId/competitors/:competitorId', requireRole('ADMIN'), knowledgeController.updateCompetitor);
    router.delete('/organizations/:orgId/competitors/:competitorId', requireRole('ADMIN'), knowledgeController.deleteCompetitor);
    router.get('/organizations/:orgId/competitors', knowledgeController.listCompetitors); // Read access for all

    // Knowledge search routes - Read access for all
    router.post('/organizations/:orgId/search', knowledgeController.searchKnowledge);

    return router;
};
