// Knowledge Base domain entities

export const DocumentType = {
    PRODUCT_DOC: 'PRODUCT_DOC',
    VALUE_PROP: 'VALUE_PROP',
    FAQ: 'FAQ',
    CASE_STUDY: 'CASE_STUDY',
    COMPETITOR_DOC: 'COMPETITOR_DOC',
    OTHER: 'OTHER',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

// Knowledge document entity (matches Prisma schema)
export interface KnowledgeDocument {
    id: string;
    organizationId: string;
    title: string;
    description?: string;
    documentType: DocumentType;
    fileUrl: string; // S3/storage URL
    fileName: string;
    fileSize: number; // bytes
    mimeType: string;
    embeddingGenerated: boolean;
    vectorStoreId?: string; // External vector DB ID
    uploadedAt: Date;
    updatedAt: Date;
}

// Document chunk for embedding
export interface DocumentChunk {
    id: string;
    documentId: string;
    organizationId: string;
    content: string;
    chunkIndex: number;
    embeddingId?: string; // Reference to vector database
    createdAt: Date;
}

// Competitor entity (matches Prisma schema)
export interface Competitor {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    strengths: string[];
    weaknesses: string[];
    differentiators: string[];
    pricingInfo?: string;
    website?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Knowledge base search result
export interface KnowledgeSearchResult {
    documentId: string;
    documentTitle: string;
    chunkContent: string;
    chunkIndex: number;
    relevanceScore: number;
    metadata?: Record<string, any>;
}

// AI retrieval context
export interface RetrievalContext {
    query: string;
    organizationId: string;
    maxResults: number;
    minRelevanceScore: number;
    includeCompetitors: boolean;
}

// Retrieval response
export interface RetrievalResponse {
    documents: KnowledgeSearchResult[];
    competitors: Competitor[];
    totalResults: number;
    queryTime: number; // in milliseconds
}
