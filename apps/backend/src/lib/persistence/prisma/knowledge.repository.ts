import { PrismaClient } from '@prisma/client';
import {
    IKnowledgeDocumentRepository,
    IDocumentChunkRepository,
    ICompetitorRepository,
} from '@/features/knowledge-base/knowledge.repository';
import { 
    DocumentQuery, 
    DocumentListResponse,
    CompetitorQuery,
    CompetitorListResponse 
} from '@/features/knowledge-base/knowledge.dto';
import { 
    KnowledgeDocument, 
    DocumentType, 
    Competitor,
    DocumentChunk 
} from '@/features/knowledge-base/knowledge.entity';

export class PrismaKnowledgeDocumentRepository implements IKnowledgeDocumentRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(document: Omit<KnowledgeDocument, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<KnowledgeDocument> {
        const created = await this.prisma.knowledgeDocument.create({
            data: {
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
            },
        });

        return this.mapToDocument(created);
    }

    async findById(documentId: string): Promise<KnowledgeDocument | null> {
        const document = await this.prisma.knowledgeDocument.findUnique({
            where: { id: documentId },
        });

        return document ? this.mapToDocument(document) : null;
    }

    async findByOrganizationId(organizationId: string, query: DocumentQuery): Promise<DocumentListResponse> {
        const { page, limit, documentType, search } = query;
        const skip = (page - 1) * limit;

        const where = {
            organizationId,
            ...(documentType && { documentType }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { fileName: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [documents, total] = await Promise.all([
            this.prisma.knowledgeDocument.findMany({
                where,
                orderBy: { uploadedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.knowledgeDocument.count({ where }),
        ]);

        return {
            documents: documents.map(d => this.mapToDocument(d)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(documentId: string, updates: Partial<KnowledgeDocument>): Promise<KnowledgeDocument> {
        const updated = await this.prisma.knowledgeDocument.update({
            where: { id: documentId },
            data: {
                ...(updates.title && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.embeddingGenerated !== undefined && { embeddingGenerated: updates.embeddingGenerated }),
                ...(updates.vectorStoreId !== undefined && { vectorStoreId: updates.vectorStoreId }),
            },
        });

        return this.mapToDocument(updated);
    }

    async delete(documentId: string): Promise<void> {
        await this.prisma.knowledgeDocument.delete({
            where: { id: documentId },
        });
    }

    private mapToDocument(document: any): KnowledgeDocument {
        return {
            id: document.id,
            organizationId: document.organizationId,
            title: document.title,
            description: document.description || undefined,
            documentType: document.documentType as DocumentType,
            fileUrl: document.fileUrl,
            fileName: document.fileName,
            fileSize: Number(document.fileSize),
            mimeType: document.mimeType,
            embeddingGenerated: document.embeddingGenerated,
            vectorStoreId: document.vectorStoreId || undefined,
            uploadedAt: document.uploadedAt,
            updatedAt: document.updatedAt,
        };
    }
}

export class PrismaDocumentChunkRepository implements IDocumentChunkRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(chunk: Omit<DocumentChunk, 'id' | 'createdAt'>): Promise<DocumentChunk> {
        // Since documentChunk table doesn't exist in schema, we'll mock this
        // In a real implementation, this would store chunks in a separate table
        return {
            id: `chunk_${Date.now()}`,
            documentId: chunk.documentId,
            organizationId: chunk.organizationId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            embeddingId: chunk.embeddingId,
            createdAt: new Date(),
        };
    }

    async findByDocumentId(documentId: string): Promise<DocumentChunk[]> {
        // Mock implementation since table doesn't exist
        return [];
    }

    async deleteByDocumentId(documentId: string): Promise<void> {
        // Mock implementation since table doesn't exist
    }

    async updateEmbeddingId(chunkId: string, embeddingId: string): Promise<void> {
        // Mock implementation since table doesn't exist
    }
}

export class PrismaCompetitorRepository implements ICompetitorRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(competitor: Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Competitor> {
        const created = await this.prisma.competitor.create({
            data: {
                organizationId: competitor.organizationId,
                name: competitor.name,
                description: competitor.description,
                strengths: competitor.strengths,
                weaknesses: competitor.weaknesses,
                differentiators: competitor.differentiators,
                pricingInfo: competitor.pricingInfo,
                website: competitor.website,
            },
        });

        return this.mapToCompetitor(created);
    }

    async findById(competitorId: string): Promise<Competitor | null> {
        const competitor = await this.prisma.competitor.findUnique({
            where: { id: competitorId },
        });

        return competitor ? this.mapToCompetitor(competitor) : null;
    }

    async findByOrganizationId(organizationId: string, query: CompetitorQuery): Promise<CompetitorListResponse> {
        const { page, limit, search } = query;
        const skip = (page - 1) * limit;

        const where = {
            organizationId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [competitors, total] = await Promise.all([
            this.prisma.competitor.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.competitor.count({ where }),
        ]);

        return {
            competitors: competitors.map(c => this.mapToCompetitor(c)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(competitorId: string, updates: Partial<Competitor>): Promise<Competitor> {
        const updated = await this.prisma.competitor.update({
            where: { id: competitorId },
            data: {
                ...(updates.name && { name: updates.name }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.strengths && { strengths: updates.strengths }),
                ...(updates.weaknesses && { weaknesses: updates.weaknesses }),
                ...(updates.differentiators && { differentiators: updates.differentiators }),
                ...(updates.pricingInfo !== undefined && { pricingInfo: updates.pricingInfo }),
                ...(updates.website !== undefined && { website: updates.website }),
            },
        });

        return this.mapToCompetitor(updated);
    }

    async delete(competitorId: string): Promise<void> {
        await this.prisma.competitor.delete({
            where: { id: competitorId },
        });
    }

    async searchByName(organizationId: string, name: string): Promise<Competitor[]> {
        const competitors = await this.prisma.competitor.findMany({
            where: {
                organizationId,
                name: { contains: name, mode: 'insensitive' as const },
            },
            take: 10,
        });

        return competitors.map(c => this.mapToCompetitor(c));
    }

    private mapToCompetitor(competitor: any): Competitor {
        return {
            id: competitor.id,
            organizationId: competitor.organizationId,
            name: competitor.name,
            description: competitor.description || undefined,
            strengths: competitor.strengths || [],
            weaknesses: competitor.weaknesses || [],
            differentiators: competitor.differentiators || [],
            pricingInfo: competitor.pricingInfo || undefined,
            website: competitor.website || undefined,
            createdAt: competitor.createdAt,
            updatedAt: competitor.updatedAt,
        };
    }
}
