import { 
    KnowledgeDocument, 
    DocumentType, 
    Competitor,
    DocumentChunk 
} from './knowledge.entity';
import { 
    DocumentUploadRequest,
    DocumentUploadResponse,
    CreateCompetitorRequest,
    UpdateCompetitorRequest,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    DocumentQuery,
    CompetitorQuery
} from './knowledge.dto';
import { 
    IKnowledgeDocumentRepository,
    IDocumentChunkRepository,
    ICompetitorRepository,
    IStorageService,
    IEmbeddingService,
    IKnowledgeSearchService
} from './knowledge.repository';
import { AuthenticatedRequest } from '@/types/auth';
import { requireRole } from '@/core/middleware/role-guard.middleware';
import { DatabaseTransaction } from '@/lib/database/transaction';

export class KnowledgeBaseService {
    constructor(
        private readonly documentRepo: IKnowledgeDocumentRepository,
        private readonly chunkRepo: IDocumentChunkRepository,
        private readonly competitorRepo: ICompetitorRepository,
        private readonly storageService: IStorageService,
        private readonly embeddingService: IEmbeddingService,
        private readonly searchService: IKnowledgeSearchService,
        private readonly dbTransaction: DatabaseTransaction,
    ) {}

    // Task_KB_01, KB_02, KB_03: Document upload workflow
    async initiateDocumentUpload(
        organizationId: string,
        request: DocumentUploadRequest,
        uploadedBy: string
    ): Promise<DocumentUploadResponse> {
        // Generate upload URL and storage key
        const { uploadUrl, storageKey, expiresAt } = await this.storageService.generateUploadUrl(
            request.fileName,
            request.mimeType,
            3600 // 1 hour expiry
        );

        // Create document record
        const document = await this.documentRepo.create({
            organizationId,
            title: request.title,
            description: request.description,
            documentType: request.documentType,
            fileUrl: storageKey,
            fileName: request.fileName,
            fileSize: request.fileSize,
            mimeType: request.mimeType,
            embeddingGenerated: false,
        });

        return {
            document: this.mapDocumentToResponse(document),
            uploadUrl,
            expiresAt,
        };
    }

    // Task_KB_06, KB_07: Process uploaded document and generate embeddings
    async processUploadedDocument(documentId: string): Promise<void> {
        try {
            await this.dbTransaction.execute(async (tx) => {
                const document = await this.documentRepo.findById(documentId);
                if (!document) {
                    throw new Error('Document not found');
                }

                // In a real implementation, this would:
                // 1. Download the file from storage
                // 2. Extract text content (PDF parsing, etc.)
                // 3. Chunk the content
                // 4. Generate embeddings
                // 5. Store embeddings in vector database

                // For now, we'll simulate the process
                const mockContent = `This is the content of ${document.title}`;
                const chunks = this.chunkText(mockContent, 1000); // 1000 character chunks

                const createdChunks: string[] = [];

                // Create chunks and embeddings within transaction
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = await this.chunkRepo.create({
                        documentId,
                        organizationId: document.organizationId,
                        content: chunks[i],
                        chunkIndex: i,
                    });
                    createdChunks.push(chunk.id);

                    // Generate embedding
                    const embedding = await this.embeddingService.generateEmbedding(chunks[i]);
                    const embeddingId = await this.embeddingService.storeEmbedding(
                        documentId,
                        i,
                        chunks[i],
                        embedding
                    );

                    // Update chunk with embedding reference
                    await this.chunkRepo.updateEmbeddingId(chunk.id, embeddingId);
                }

                // Mark as ready
                await this.documentRepo.update(documentId, {
                    embeddingGenerated: true,
                    vectorStoreId: `vector_${documentId}`,
                });

                console.log(`Successfully processed document ${documentId} with ${createdChunks.length} chunks`);
            });
            
        } catch (error) {
            console.error(`Failed to process document ${documentId}:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                documentId,
                timestamp: new Date().toISOString(),
            });
            
            // Cleanup partial data on failure
            await this.cleanupFailedDocumentProcessing(documentId);
            throw error;
        }
    }

    // Task_KB_04: List documents
    async listDocuments(organizationId: string, query: DocumentQuery) {
        return await this.documentRepo.findByOrganizationId(organizationId, query);
    }

    // Task_KB_05: Delete document
    async deleteDocument(documentId: string, organizationId: string, userId: string): Promise<void> {
        const document = await this.documentRepo.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        if (document.organizationId !== organizationId) {
            throw new Error('Access denied');
        }

        // Delete from storage
        await this.storageService.deleteFile(document.fileUrl);

        // Delete embeddings
        await this.embeddingService.deleteEmbeddings(documentId);

        // Delete chunks
        await this.chunkRepo.deleteByDocumentId(documentId);

        // Delete document record
        await this.documentRepo.delete(documentId);
    }

    // Task_KB_08: Competitor CRUD operations
    async createCompetitor(
        organizationId: string,
        request: CreateCompetitorRequest,
        createdBy: string
    ): Promise<Competitor> {
        return await this.dbTransaction.execute(async (tx) => {
            return await this.competitorRepo.create({
                organizationId,
                ...request,
                // TODO: Add audit fields when schema supports them
                // createdBy,
                // createdAt: new Date(),
            });
        });
    }

    async updateCompetitor(
        competitorId: string,
        organizationId: string,
        updates: UpdateCompetitorRequest
    ): Promise<Competitor> {
        return await this.dbTransaction.execute(async (tx) => {
            const competitor = await this.competitorRepo.findById(competitorId);
            if (!competitor) {
                throw new Error('Competitor not found');
            }

            if (competitor.organizationId !== organizationId) {
                throw new Error('Access denied');
            }

            return await this.competitorRepo.update(competitorId, {
                ...updates,
                // TODO: Add audit fields when schema supports them
                // updatedAt: new Date(),
                // updatedBy: userId,
            });
        });
    }

    async deleteCompetitor(competitorId: string, organizationId: string): Promise<void> {
        await this.dbTransaction.execute(async (tx) => {
            const competitor = await this.competitorRepo.findById(competitorId);
            if (!competitor) {
                throw new Error('Competitor not found');
            }

            if (competitor.organizationId !== organizationId) {
                throw new Error('Access denied');
            }

            await this.competitorRepo.delete(competitorId);
        });
    }

    async listCompetitors(organizationId: string, query: CompetitorQuery) {
        return await this.competitorRepo.findByOrganizationId(organizationId, query);
    }

    // Task_KB_10: Knowledge search
    async searchKnowledge(organizationId: string, request: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse> {
        const context = {
            query: request.query,
            organizationId,
            maxResults: request.maxResults,
            minRelevanceScore: request.minRelevanceScore,
            includeCompetitors: request.includeCompetitors,
        };

        return await this.searchService.search(context);
    }

    // Task_KB_11: Generate download URL for document
    async generateDocumentDownloadUrl(documentId: string, organizationId: string, userId: string): Promise<string> {
        const document = await this.documentRepo.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        if (document.organizationId !== organizationId) {
            throw new Error('Access denied');
        }

        // Generate signed download URL from storage service
        return await this.storageService.generateDownloadUrl(document.fileUrl);
    }

    // Helper methods
    private async cleanupFailedDocumentProcessing(documentId: string): Promise<void> {
        try {
            console.log(`Cleaning up failed document processing for ${documentId}`);
            
            // Delete chunks that might have been created
            await this.chunkRepo.deleteByDocumentId(documentId);
            
            // Delete embeddings that might have been created
            await this.embeddingService.deleteEmbeddings(documentId);
            
            // Reset document status
            await this.documentRepo.update(documentId, {
                embeddingGenerated: false,
                vectorStoreId: undefined,
            });
            
            console.log(`Successfully cleaned up document ${documentId}`);
        } catch (cleanupError) {
            console.error(`Failed to cleanup document ${documentId}:`, cleanupError);
            // Don't re-throw cleanup errors to avoid masking the original error
        }
    }

    private chunkText(text: string, chunkSize: number): string[] {
        if (!text || text.length === 0) {
            return [];
        }
        
        if (chunkSize <= 0) {
            throw new Error('Chunk size must be positive');
        }

        const chunks: string[] = [];
        const textLength = text.length;
        
        // More memory-efficient chunking that avoids creating intermediate strings
        for (let i = 0; i < textLength; i += chunkSize) {
            const end = Math.min(i + chunkSize, textLength);
            chunks.push(text.substring(i, end));
        }
        
        return chunks;
    }

    private mapDocumentToResponse(document: KnowledgeDocument) {
        return {
            id: document.id,
            organizationId: document.organizationId,
            title: document.title,
            description: document.description,
            documentType: document.documentType,
            fileUrl: document.fileUrl,
            fileName: document.fileName,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
            embeddingGenerated: document.embeddingGenerated,
            vectorStoreId: document.vectorStoreId,
            uploadedAt: document.uploadedAt,
            updatedAt: document.updatedAt,
        };
    }

    private mapCompetitorToResponse(competitor: Competitor) {
        return {
            id: competitor.id,
            organizationId: competitor.organizationId,
            name: competitor.name,
            description: competitor.description,
            strengths: competitor.strengths,
            weaknesses: competitor.weaknesses,
            differentiators: competitor.differentiators,
            pricingInfo: competitor.pricingInfo,
            website: competitor.website,
            createdAt: competitor.createdAt,
            updatedAt: competitor.updatedAt,
        };
    }
}
