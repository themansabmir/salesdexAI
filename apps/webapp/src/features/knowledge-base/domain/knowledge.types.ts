// Knowledge Base domain types for frontend

export const DocumentType = {
    PRODUCT_DOC: 'PRODUCT_DOC',
    VALUE_PROP: 'VALUE_PROP',
    FAQ: 'FAQ',
    CASE_STUDY: 'CASE_STUDY',
    COMPETITOR_DOC: 'COMPETITOR_DOC',
    OTHER: 'OTHER',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface KnowledgeDocument {
    id: string;
    organizationId: string;
    title: string;
    description?: string;
    documentType: DocumentType;
    fileUrl: string;
    fileName: string;
    fileSize: number; // bytes
    mimeType: string;
    embeddingGenerated: boolean;
    vectorStoreId?: string;
    uploadedAt: string; // ISO string
    updatedAt: string; // ISO string
}

export interface DocumentUploadRequest {
    title: string;
    description?: string;
    documentType: DocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface DocumentUploadResponse {
    document: KnowledgeDocument;
    uploadUrl: string; // Signed URL for direct upload
    expiresAt: string; // ISO string
}

export interface DocumentQuery {
    page?: number;
    limit?: number;
    documentType?: DocumentType;
    search?: string;
}

export interface DocumentListResponse {
    documents: KnowledgeDocument[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

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
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

export interface CreateCompetitorRequest {
    name: string;
    description?: string;
    strengths: string[];
    weaknesses: string[];
    differentiators: string[];
    pricingInfo?: string;
    website?: string;
}

export interface UpdateCompetitorRequest {
    name?: string;
    description?: string;
    strengths?: string[];
    weaknesses?: string[];
    differentiators?: string[];
    pricingInfo?: string;
    website?: string;
}

export interface CompetitorQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CompetitorListResponse {
    competitors: Competitor[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface KnowledgeSearchRequest {
    query: string;
    maxResults?: number;
    minRelevanceScore?: number;
    includeCompetitors?: boolean;
}

export interface KnowledgeSearchResult {
    documentId: string;
    documentTitle: string;
    chunkContent: string;
    chunkIndex: number;
    relevanceScore: number;
    metadata?: Record<string, any>;
}

export interface KnowledgeSearchResponse {
    documents: KnowledgeSearchResult[];
    competitors: Competitor[];
    totalResults: number;
    queryTime: number; // in milliseconds
}

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get document type label
export const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels = {
        [DocumentType.PRODUCT_DOC]: 'Product Documentation',
        [DocumentType.VALUE_PROP]: 'Value Proposition',
        [DocumentType.FAQ]: 'FAQ',
        [DocumentType.CASE_STUDY]: 'Case Study',
        [DocumentType.COMPETITOR_DOC]: 'Competitor Analysis',
        [DocumentType.OTHER]: 'Other',
    };
    
    return labels[type] || type;
};

// Helper function to get document type color
export const getDocumentTypeColor = (type: DocumentType): string => {
    const colors = {
        [DocumentType.PRODUCT_DOC]: 'blue',
        [DocumentType.VALUE_PROP]: 'green',
        [DocumentType.FAQ]: 'purple',
        [DocumentType.CASE_STUDY]: 'orange',
        [DocumentType.COMPETITOR_DOC]: 'red',
        [DocumentType.OTHER]: 'gray',
    };
    
    return colors[type] || 'gray';
};
