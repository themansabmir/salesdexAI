// System Configuration Repository Interface

import { SystemConfig, OrganizationFeature, SystemAuditLog } from './system.entity';

export interface ISystemConfigRepository {
    findByKey(key: string): Promise<SystemConfig | null>;
    findAll(): Promise<SystemConfig[]>;
    upsert(key: string, value: string, updatedBy: string, description?: string): Promise<SystemConfig>;
}

export interface IOrganizationFeatureRepository {
    findByOrgAndFeature(organizationId: string, featureKey: string): Promise<OrganizationFeature | null>;
    findAllByOrg(organizationId: string): Promise<OrganizationFeature[]>;
    upsert(organizationId: string, featureKey: string, enabled: boolean, updatedBy: string): Promise<OrganizationFeature>;
}

export interface ISystemAuditLogRepository {
    create(data: {
        action: SystemAuditLog['action'];
        actorId: string;
        targetOrgId?: string;
        details: Record<string, any>;
    }): Promise<SystemAuditLog>;
    
    findRecent(limit: number): Promise<SystemAuditLog[]>;
    findByOrg(organizationId: string, limit: number): Promise<SystemAuditLog[]>;
    findByActor(actorId: string, limit: number): Promise<SystemAuditLog[]>;
}

// Global metrics aggregation interface
export interface IMetricsRepository {
    getGlobalMetrics(): Promise<{
        totalOrganizations: number;
        totalUsers: number;
        activeMeetings: number;
        totalUsageHours: number;
        totalRevenue: number;
    }>;
    
    getOrgMetrics(organizationId: string): Promise<{
        totalMeetings: number;
        totalUsageHours: number;
        totalCost: number;
        activeUsers: number;
    }>;
}
