import { prisma } from '@/lib/prisma';
import { PrismaAuthRepository } from '@/lib/persistence/prisma/auth.repository';
import { BcryptHasher } from '@/lib/crypto/bcrypt-hasher.service';
import { JwtTokenService } from '@/lib/jwt/jwt-token.service';
import { AuthService } from '@/features/auth/auth.service';
import { AuthController } from '@/features/auth/auth.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';

// Instantiate infrastructure
export const passwordHasher = new BcryptHasher();
export const tokenService = new JwtTokenService();

// Auth Feature
export const authRepository = new PrismaAuthRepository(prisma);
export const authService = new AuthService(authRepository, passwordHasher, tokenService);
export const authController = new AuthController(authService, authRepository);

// Organization Feature
import { PrismaOrganizationRepository, PrismaInvitationRepository } from '@/lib/persistence/prisma/org.repository';
import { OrganizationService } from '@/features/organization/org.service';
import { OrganizationController } from '@/features/organization/org.controller';

export const orgRepository = new PrismaOrganizationRepository(prisma);
export const invitationRepository = new PrismaInvitationRepository(prisma);
export const orgService = new OrganizationService(orgRepository, authRepository, invitationRepository);
export const orgController = new OrganizationController(orgService);

// User Feature
import { PrismaUserRepository } from '@/lib/persistence/prisma/user.repository';
import { UserService } from '@/features/user/user.service';
import { UserController } from '@/features/user/user.controller';

export const userRepository = new PrismaUserRepository(prisma);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

// System Feature (Epic 3)
import {
    PrismaSystemConfigRepository,
    PrismaOrganizationFeatureRepository,
    PrismaSystemAuditLogRepository,
    PrismaMetricsRepository,
} from '@/lib/persistence/prisma/system.repository';
import { SystemService } from '@/features/system/system.service';
import { SystemController } from '@/features/system/system.controller';

export const systemConfigRepository = new PrismaSystemConfigRepository(prisma);
export const orgFeatureRepository = new PrismaOrganizationFeatureRepository(prisma);
export const auditLogRepository = new PrismaSystemAuditLogRepository(prisma);
export const metricsRepository = new PrismaMetricsRepository(prisma);

export const systemService = new SystemService(
    systemConfigRepository,
    orgFeatureRepository,
    auditLogRepository,
    metricsRepository,
    orgRepository,
);
export const systemController = new SystemController(systemService);

// Billing Feature (Epic 4)
import {
    PrismaWalletRepository,
    PrismaBillingRepository,
    PrismaLowBalanceWarningRepository,
} from '@/lib/persistence/prisma/billing.repository';
import { BillingService } from '@/features/billing/billing.service';
import { BillingController } from '@/features/billing/billing.controller';
import { DatabaseTransaction } from '@/lib/database/transaction';

export const walletRepository = new PrismaWalletRepository(prisma);
export const billingRepository = new PrismaBillingRepository(prisma);
export const lowBalanceWarningRepository = new PrismaLowBalanceWarningRepository(prisma);
export const dbTransaction = new DatabaseTransaction(prisma);

export const billingService = new BillingService(
    walletRepository,
    billingRepository,
    lowBalanceWarningRepository,
    orgRepository,
    systemConfigRepository,
    dbTransaction,
);
export const billingController = new BillingController(billingService);

// Knowledge Base Feature (Epic 5)
import {
    PrismaKnowledgeDocumentRepository,
    PrismaDocumentChunkRepository,
    PrismaCompetitorRepository,
} from '@/lib/persistence/prisma/knowledge.repository';
import { KnowledgeBaseService } from '@/features/knowledge-base/knowledge.service';
import { KnowledgeBaseController } from '@/features/knowledge-base/knowledge.controller';
import { FileUploadService, FileUploadServiceFactory } from '@/lib/fileupload';
import { StorageService } from '@/lib/storage/storage.service';

// Create file upload service based on environment
const fileUploadService = FileUploadServiceFactory.createFromEnv();

class MockEmbeddingService {
    async generateEmbedding(text: string) {
        // Mock embedding - returns array of 1536 dimensions (like OpenAI)
        return Array(1536).fill(0).map(() => Math.random());
    }

    async generateBatchEmbeddings(texts: string[]) {
        return Promise.all(texts.map(text => this.generateEmbedding(text)));
    }

    async storeEmbedding(documentId: string, chunkIndex: number, content: string, embedding: number[]) {
        return `embedding_${documentId}_${chunkIndex}`;
    }

    async searchEmbeddings(queryEmbedding: number[], organizationId: string, maxResults: number, minScore: number) {
        // Mock search results
        return [];
    }

    async deleteEmbeddings(documentId: string) {
        // Mock implementation
    }
}

class MockKnowledgeSearchService {
    async search(context: any) {
        return {
            documents: [],
            competitors: [],
            totalResults: 0,
            queryTime: 0,
        };
    }

    async indexDocument(document: any, chunks: any[]) {
        // Mock implementation
    }

    async removeDocument(documentId: string) {
        // Mock implementation
    }
}

export const knowledgeDocumentRepo = new PrismaKnowledgeDocumentRepository(prisma);
export const documentChunkRepo = new PrismaDocumentChunkRepository(prisma);
export const competitorRepo = new PrismaCompetitorRepository(prisma);
export const storageService = new StorageService(fileUploadService);
export const embeddingService = new MockEmbeddingService();
export const searchService = new MockKnowledgeSearchService();

export const knowledgeService = new KnowledgeBaseService(
    knowledgeDocumentRepo,
    documentChunkRepo,
    competitorRepo,
    storageService,
    embeddingService,
    searchService,
    dbTransaction,
);
export const knowledgeController = new KnowledgeBaseController(knowledgeService);

// Middleware
export const authMiddleware = createAuthMiddleware(tokenService);
