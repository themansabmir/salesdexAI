import { z } from 'zod';
import { DocumentType } from './knowledge.entity';

// Knowledge document response DTO
export const KnowledgeDocumentResponseSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    documentType: z.enum([
        DocumentType.PRODUCT_DOC, 
        DocumentType.VALUE_PROP, 
        DocumentType.FAQ, 
        DocumentType.CASE_STUDY, 
        DocumentType.COMPETITOR_DOC, 
        DocumentType.OTHER
    ]),
    fileUrl: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    embeddingGenerated: z.boolean(),
    vectorStoreId: z.string().optional(),
    uploadedAt: z.date(),
    updatedAt: z.date(),
});

export type KnowledgeDocumentResponse = z.infer<typeof KnowledgeDocumentResponseSchema>;

// Document upload request
export const DocumentUploadRequestSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    documentType: z.enum([
        DocumentType.PRODUCT_DOC, 
        DocumentType.VALUE_PROP, 
        DocumentType.FAQ, 
        DocumentType.CASE_STUDY, 
        DocumentType.COMPETITOR_DOC, 
        DocumentType.OTHER
    ]),
    fileName: z.string().min(1).max(255),
    fileSize: z.number().min(0),
    mimeType: z.string(),
});

export type DocumentUploadRequest = z.infer<typeof DocumentUploadRequestSchema>;

// Document upload response (includes signed URL)
export const DocumentUploadResponseSchema = z.object({
    document: KnowledgeDocumentResponseSchema,
    uploadUrl: z.string(), // Signed URL for direct upload
    expiresAt: z.date(),
});

export type DocumentUploadResponse = z.infer<typeof DocumentUploadResponseSchema>;

// Document query parameters
export const DocumentQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    documentType: z.enum([
        DocumentType.PRODUCT_DOC, 
        DocumentType.VALUE_PROP, 
        DocumentType.FAQ, 
        DocumentType.CASE_STUDY, 
        DocumentType.COMPETITOR_DOC, 
        DocumentType.OTHER
    ]).optional(),
    search: z.string().optional(),
});

export type DocumentQuery = z.infer<typeof DocumentQuerySchema>;

// Paginated documents response
export const DocumentListResponseSchema = z.object({
    documents: z.array(KnowledgeDocumentResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});

export type DocumentListResponse = z.infer<typeof DocumentListResponseSchema>;

// Competitor response DTO
export const CompetitorResponseSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    differentiators: z.array(z.string()),
    pricingInfo: z.string().optional(),
    website: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type CompetitorResponse = z.infer<typeof CompetitorResponseSchema>;

// Competitor CRUD requests
export const CreateCompetitorRequestSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    strengths: z.array(z.string().max(500)).max(10),
    weaknesses: z.array(z.string().max(500)).max(10),
    differentiators: z.array(z.string().max(500)).max(10),
    pricingInfo: z.string().max(500).optional(),
    website: z.string().max(500).optional(),
});

export type CreateCompetitorRequest = z.infer<typeof CreateCompetitorRequestSchema>;

export const UpdateCompetitorRequestSchema = CreateCompetitorRequestSchema.partial();

export type UpdateCompetitorRequest = z.infer<typeof UpdateCompetitorRequestSchema>;

// Competitor query parameters
export const CompetitorQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
});

export type CompetitorQuery = z.infer<typeof CompetitorQuerySchema>;

// Paginated competitors response
export const CompetitorListResponseSchema = z.object({
    competitors: z.array(CompetitorResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});

export type CompetitorListResponse = z.infer<typeof CompetitorListResponseSchema>;

// Knowledge search request
export const KnowledgeSearchRequestSchema = z.object({
    query: z.string().min(1).max(1000),
    maxResults: z.coerce.number().min(1).max(20).default(5),
    minRelevanceScore: z.coerce.number().min(0).max(1).default(0.7),
    includeCompetitors: z.boolean().default(true),
});

export type KnowledgeSearchRequest = z.infer<typeof KnowledgeSearchRequestSchema>;

// Knowledge search response
export const KnowledgeSearchResponseSchema = z.object({
    documents: z.array(z.object({
        documentId: z.string(),
        documentTitle: z.string(),
        chunkContent: z.string(),
        chunkIndex: z.number(),
        relevanceScore: z.number(),
        metadata: z.record(z.string(), z.any()).optional(),
    })),
    competitors: z.array(CompetitorResponseSchema),
    totalResults: z.number(),
    queryTime: z.number(),
});

export type KnowledgeSearchResponse = z.infer<typeof KnowledgeSearchResponseSchema>;
