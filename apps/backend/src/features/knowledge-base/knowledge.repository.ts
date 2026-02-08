import { 
    KnowledgeDocument, 
    DocumentChunk, 
    Competitor, 
    KnowledgeSearchResult,
    RetrievalContext,
    RetrievalResponse 
} from './knowledge.entity';
import { 
    DocumentQuery, 
    DocumentListResponse,
    CompetitorQuery,
    CompetitorListResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse
} from './knowledge.dto';

// Repository interfaces following Clean Architecture
export interface IKnowledgeDocumentRepository {
    create(document: Omit<KnowledgeDocument, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<KnowledgeDocument>;
    findById(documentId: string): Promise<KnowledgeDocument | null>;
    findByOrganizationId(organizationId: string, query: DocumentQuery): Promise<DocumentListResponse>;
    update(documentId: string, updates: Partial<KnowledgeDocument>): Promise<KnowledgeDocument>;
    delete(documentId: string): Promise<void>;
}

export interface IDocumentChunkRepository {
    create(chunk: Omit<DocumentChunk, 'id' | 'createdAt'>): Promise<DocumentChunk>;
    findByDocumentId(documentId: string): Promise<DocumentChunk[]>;
    deleteByDocumentId(documentId: string): Promise<void>;
    updateEmbeddingId(chunkId: string, embeddingId: string): Promise<void>;
}

export interface ICompetitorRepository {
    create(competitor: Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Competitor>;
    findById(competitorId: string): Promise<Competitor | null>;
    findByOrganizationId(organizationId: string, query: CompetitorQuery): Promise<CompetitorListResponse>;
    update(competitorId: string, updates: Partial<Competitor>): Promise<Competitor>;
    delete(competitorId: string): Promise<void>;
    searchByName(organizationId: string, name: string): Promise<Competitor[]>;
}

export interface IStorageService {
    generateUploadUrl(filename: string, contentType: string, expiresIn?: number): Promise<{
        uploadUrl: string;
        storageKey: string;
        expiresAt: Date;
    }>;
    generateDownloadUrl(storageKey: string, expiresIn?: number): Promise<string>;
    deleteFile(storageKey: string): Promise<void>;
}

export interface IEmbeddingService {
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    storeEmbedding(
        documentId: string,
        chunkIndex: number,
        content: string,
        embedding: number[]
    ): Promise<string>; // Returns embedding ID
    searchEmbeddings(
        queryEmbedding: number[],
        organizationId: string,
        maxResults: number,
        minScore: number
    ): Promise<KnowledgeSearchResult[]>;
    deleteEmbeddings(documentId: string): Promise<void>;
}

export interface IKnowledgeSearchService {
    search(context: RetrievalContext): Promise<RetrievalResponse>;
    indexDocument(document: KnowledgeDocument, chunks: DocumentChunk[]): Promise<void>;
    removeDocument(documentId: string): Promise<void>;
}
