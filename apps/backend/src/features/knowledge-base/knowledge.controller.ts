import { Request, Response, NextFunction } from 'express';
import { KnowledgeBaseService } from './knowledge.service';
import {
    DocumentUploadRequestSchema,
    DocumentQuerySchema,
    CreateCompetitorRequestSchema,
    UpdateCompetitorRequestSchema,
    CompetitorQuerySchema,
    KnowledgeSearchRequestSchema,
} from './knowledge.dto';
import { AuthenticatedRequest } from '@/types/auth';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export class KnowledgeBaseController {
    constructor(private readonly knowledgeService: KnowledgeBaseService) {}

    // Document management endpoints
    
    // Task_KB_01: Initiate document upload
    initiateUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const requestData = DocumentUploadRequestSchema.parse(req.body);
            
            const result = await this.knowledgeService.initiateDocumentUpload(
                orgId,
                requestData,
                userId
            );
            
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    // Confirm upload completion (webhook from storage service)
    confirmUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { documentId } = req.body;
            
            // Input validation
            if (!documentId || typeof documentId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid document ID is required' 
                });
            }

            if (documentId.length > 255) {
                return res.status(400).json({ 
                    message: 'Document ID is too long' 
                });
            }
            
            await this.knowledgeService.processUploadedDocument(documentId);
            res.json({ message: 'Document processing started' });
        } catch (error) {
            next(error);
        }
    };

    // Task_KB_04: List documents
    listDocuments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            
            // Input validation
            if (!orgId || typeof orgId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid organization ID is required' 
                });
            }

            const query = DocumentQuerySchema.parse(req.query);
            
            const result = await this.knowledgeService.listDocuments(orgId, query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // Task_KB_05: Delete document
    deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const documentId = req.params.documentId as string;
            
            // Input validation
            if (!orgId || typeof orgId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid organization ID is required' 
                });
            }

            if (!documentId || typeof documentId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid document ID is required' 
                });
            }

            if (documentId.length > 255) {
                return res.status(400).json({ 
                    message: 'Document ID is too long' 
                });
            }
            
            await this.knowledgeService.deleteDocument(documentId, orgId, userId);
            res.json({ message: 'Document deleted successfully' });
        } catch (error) {
            next(error);
        }
    };

    // Task_KB_11: Generate download URL for document
    getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const documentId = req.params.documentId as string;
            
            // Input validation
            if (!orgId || typeof orgId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid organization ID is required' 
                });
            }

            if (!documentId || typeof documentId !== 'string') {
                return res.status(400).json({ 
                    message: 'Valid document ID is required' 
                });
            }

            if (documentId.length > 255) {
                return res.status(400).json({ 
                    message: 'Document ID is too long' 
                });
            }
            
            const downloadUrl = await this.knowledgeService.generateDocumentDownloadUrl(documentId, orgId, userId);
            res.json({ downloadUrl });
        } catch (error) {
            next(error);
        }
    };

    // Competitor management endpoints (Task_KB_08)
    
    createCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const requestData = CreateCompetitorRequestSchema.parse(req.body);
            
            const competitor = await this.knowledgeService.createCompetitor(
                orgId,
                requestData,
                userId
            );
            
            res.status(201).json(competitor);
        } catch (error) {
            next(error);
        }
    };

    updateCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const competitorId = req.params.competitorId as string;
            const requestData = UpdateCompetitorRequestSchema.parse(req.body);
            
            const competitor = await this.knowledgeService.updateCompetitor(
                competitorId,
                orgId,
                requestData
            );
            
            res.json(competitor);
        } catch (error) {
            next(error);
        }
    };

    deleteCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const competitorId = req.params.competitorId as string;
            
            await this.knowledgeService.deleteCompetitor(competitorId, orgId);
            res.json({ message: 'Competitor deleted successfully' });
        } catch (error) {
            next(error);
        }
    };

    listCompetitors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const query = CompetitorQuerySchema.parse(req.query);
            
            const result = await this.knowledgeService.listCompetitors(orgId, query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // Task_KB_10: Knowledge search
    searchKnowledge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const orgId = req.params.orgId as string;
            const requestData = KnowledgeSearchRequestSchema.parse(req.body);
            
            const result = await this.knowledgeService.searchKnowledge(orgId, requestData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
