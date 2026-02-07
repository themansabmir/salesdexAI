import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config";
import { logger } from "@/core/utils";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: env.isDevelopment ? ["query", "error", "warn"] : ["error"],
    });

if (!env.isProduction) {
    globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info("🐘 Database connected successfully via PostgreSQL adapter");
    } catch (error) {
        logger.error("❌ Database connection failed", error as Error);
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    logger.info("🔌 Database disconnected");
}
