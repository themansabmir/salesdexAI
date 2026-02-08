import { PrismaClient } from '@prisma/client';
import {
    ISystemConfigRepository,
    IOrganizationFeatureRepository,
    ISystemAuditLogRepository,
    IMetricsRepository,
} from '@/features/system/system.repository';
import { SystemConfig, OrganizationFeature, SystemAuditLog } from '@/features/system/system.entity';

export class PrismaSystemConfigRepository implements ISystemConfigRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByKey(key: string): Promise<SystemConfig | null> {
        const config = await this.prisma.systemConfig.findUnique({
            where: { key },
        });
        return config ? this.mapConfigToEntity(config) : null;
    }

    async findAll(): Promise<SystemConfig[]> {
        const configs = await this.prisma.systemConfig.findMany({
            orderBy: { key: 'asc' },
        });
        return configs.map((c) => this.mapConfigToEntity(c));
    }

    async upsert(
        key: string,
        value: string,
        updatedBy: string,
        description?: string,
    ): Promise<SystemConfig> {
        const config = await this.prisma.systemConfig.upsert({
            where: { key },
            update: {
                value,
                description,
            },
            create: {
                key,
                value,
                description,
            },
        });
        return this.mapConfigToEntity(config);
    }

    private mapConfigToEntity(config: any): SystemConfig {
        return {
            id: config.id,
            key: config.key,
            value: this.parseValue(config.value),
            description: config.description || undefined,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy || '',
        };
    }

    private parseValue(value: string): string | number | boolean {
        if (value === 'true') return true;
        if (value === 'false') return false;
        const num = Number(value);
        if (!isNaN(num)) return num;
        return value;
    }
}

export class PrismaOrganizationFeatureRepository implements IOrganizationFeatureRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByOrgAndFeature(
        organizationId: string,
        featureKey: string,
    ): Promise<OrganizationFeature | null> {
        const feature = await this.prisma.featureFlag.findUnique({
            where: {
                organizationId_flagName: {
                    organizationId,
                    flagName: featureKey,
                },
            },
        });
        return feature ? this.mapFeatureToEntity(feature) : null;
    }

    async findAllByOrg(organizationId: string): Promise<OrganizationFeature[]> {
        const features = await this.prisma.featureFlag.findMany({
            where: { organizationId },
            orderBy: { flagName: 'asc' },
        });
        return features.map((f) => this.mapFeatureToEntity(f));
    }

    async upsert(
        organizationId: string,
        featureKey: string,
        enabled: boolean,
        updatedBy: string,
    ): Promise<OrganizationFeature> {
        const feature = await this.prisma.featureFlag.upsert({
            where: {
                organizationId_flagName: {
                    organizationId,
                    flagName: featureKey,
                },
            },
            update: {
                isEnabled: enabled,
            },
            create: {
                organizationId,
                flagName: featureKey,
                isEnabled: enabled,
            },
        });
        return this.mapFeatureToEntity(feature);
    }

    private mapFeatureToEntity(feature: any): OrganizationFeature {
        return {
            id: feature.id,
            organizationId: feature.organizationId || '',
            featureKey: feature.flagName,
            enabled: feature.isEnabled,
            updatedAt: feature.updatedAt,
            updatedBy: '',
        };
    }
}

export class PrismaSystemAuditLogRepository implements ISystemAuditLogRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: {
        action: SystemAuditLog['action'];
        actorId: string;
        targetOrgId?: string;
        details: Record<string, any>;
    }): Promise<SystemAuditLog> {
        const log = await this.prisma.auditLog.create({
            data: {
                action: data.action,
                userId: data.actorId,
                resource: 'SystemConfig',
                resourceId: data.targetOrgId,
                changes: data.details,
            },
        });
        return this.mapLogToEntity(log);
    }

    async findRecent(limit: number): Promise<SystemAuditLog[]> {
        const logs = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { email: true } },
            },
        });
        return logs.map((l) => this.mapLogToEntity(l));
    }

    async findByOrg(organizationId: string, limit: number): Promise<SystemAuditLog[]> {
        const logs = await this.prisma.auditLog.findMany({
            where: { resourceId: organizationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { email: true } },
            },
        });
        return logs.map((l) => this.mapLogToEntity(l));
    }

    async findByActor(actorId: string, limit: number): Promise<SystemAuditLog[]> {
        const logs = await this.prisma.auditLog.findMany({
            where: { userId: actorId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return logs.map((l) => this.mapLogToEntity(l));
    }

    private mapLogToEntity(log: any): SystemAuditLog {
        return {
            id: log.id,
            action: log.action as SystemAuditLog['action'],
            actorId: log.userId || '',
            targetOrgId: log.resourceId || undefined,
            details: log.changes || {},
            createdAt: log.createdAt,
        };
    }
}

export class PrismaMetricsRepository implements IMetricsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async getGlobalMetrics(): Promise<{
        totalOrganizations: number;
        totalUsers: number;
        activeMeetings: number;
        totalUsageHours: number;
        totalRevenue: number;
    }> {
        const [
            totalOrganizations,
            totalUsers,
            activeMeetings,
            usageStats,
        ] = await Promise.all([
            this.prisma.organization.count(),
            this.prisma.user.count(),
            // Placeholder - would need Meeting model
            0,
            // Placeholder - would aggregate from usage records
            { totalHours: 0, totalCost: 0 },
        ]);

        return {
            totalOrganizations,
            totalUsers,
            activeMeetings,
            totalUsageHours: usageStats.totalHours,
            totalRevenue: usageStats.totalCost,
        };
    }

    async getOrgMetrics(organizationId: string): Promise<{
        totalMeetings: number;
        totalUsageHours: number;
        totalCost: number;
        activeUsers: number;
    }> {
        const [activeUsers] = await Promise.all([
            this.prisma.user.count({
                where: { organizationId },
            }),
            // Placeholder - would aggregate from meeting records
        ]);

        return {
            totalMeetings: 0, // Placeholder
            totalUsageHours: 0, // Placeholder
            totalCost: 0, // Placeholder
            activeUsers,
        };
    }
}
