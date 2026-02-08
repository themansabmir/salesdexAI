import {
    ISystemConfigRepository,
    IOrganizationFeatureRepository,
    ISystemAuditLogRepository,
    IMetricsRepository,
} from './system.repository';
import {
    UpdateSystemConfigRequest,
    UpdateOrgFeatureRequest,
    WalletAdjustmentRequest,
    SystemConfigResponse,
    OrgFeatureResponse,
    AuditLogResponse,
    GlobalMetricsResponse,
    OrganizationMetricsResponse,
} from './system.dto';
import { SYSTEM_CONFIG_KEYS, FEATURE_KEYS } from './system.entity';
import { IOrganizationRepository } from '@/features/organization/org.repository';

export class SystemService {
    constructor(
        private readonly systemConfigRepo: ISystemConfigRepository,
        private readonly orgFeatureRepo: IOrganizationFeatureRepository,
        private readonly auditLogRepo: ISystemAuditLogRepository,
        private readonly metricsRepo: IMetricsRepository,
        private readonly orgRepository: IOrganizationRepository,
    ) { }

    // Task_Sys_02: Get all system configuration
    async getSystemConfig(): Promise<SystemConfigResponse[]> {
        const configs = await this.systemConfigRepo.findAll();
        return configs.map((c) => ({
            id: c.id,
            key: c.key,
            value: c.value,
            description: c.description,
            updatedAt: c.updatedAt,
        }));
    }

    // Task_Sys_03: Update system configuration
    async updateSystemConfig(
        data: UpdateSystemConfigRequest,
        updatedBy: string,
    ): Promise<SystemConfigResponse> {
        // Get existing config to capture old value
        const existingConfig = await this.systemConfigRepo.findByKey(data.key);
        const oldValue = existingConfig?.value;

        const config = await this.systemConfigRepo.upsert(
            data.key,
            String(data.value),
            updatedBy,
            data.description,
        );

        // Task_Sys_11: Audit log the change
        await this.auditLogRepo.create({
            action: 'CONFIG_UPDATE',
            actorId: updatedBy,
            details: {
                key: data.key,
                oldValue: oldValue,
                newValue: data.value,
            },
        });

        return {
            id: config.id,
            key: config.key,
            value: config.value,
            description: config.description,
            updatedAt: config.updatedAt,
        };
    }

    // Task_Sys_05: Get global pricing
    async getPricingPerHour(): Promise<number> {
        const config = await this.systemConfigRepo.findByKey(SYSTEM_CONFIG_KEYS.PRICING_PER_HOUR);
        return config ? Number(config.value) : 2.0; // Default $2/hour
    }

    // Task_Sys_06: Get max concurrency limit
    async getMaxConcurrentMeetings(): Promise<number> {
        const config = await this.systemConfigRepo.findByKey(SYSTEM_CONFIG_KEYS.MAX_CONCURRENT_LIVE_MEETINGS);
        return config ? Number(config.value) : 100; // Default 100 concurrent
    }

    // Task_Sys_07: Get org feature flags
    async getOrgFeatures(organizationId: string): Promise<OrgFeatureResponse[]> {
        const features = await this.orgFeatureRepo.findAllByOrg(organizationId);
        return features.map((f) => ({
            id: f.id,
            organizationId: f.organizationId,
            featureKey: f.featureKey,
            enabled: f.enabled,
            updatedAt: f.updatedAt,
        }));
    }

    // Task_Sys_07: Update org feature flag
    async updateOrgFeature(
        data: UpdateOrgFeatureRequest,
        updatedBy: string,
    ): Promise<OrgFeatureResponse> {
        const feature = await this.orgFeatureRepo.upsert(
            data.organizationId,
            data.featureKey,
            data.enabled,
            updatedBy,
        );

        await this.auditLogRepo.create({
            action: 'CONFIG_UPDATE',
            actorId: updatedBy,
            targetOrgId: data.organizationId,
            details: {
                featureKey: data.featureKey,
                enabled: data.enabled,
            },
        });

        return {
            id: feature.id,
            organizationId: feature.organizationId,
            featureKey: feature.featureKey,
            enabled: feature.enabled,
            updatedAt: feature.updatedAt,
        };
    }

    // Task_Sys_12: Get global metrics
    async getGlobalMetrics(): Promise<GlobalMetricsResponse> {
        return this.metricsRepo.getGlobalMetrics();
    }

    // Get organization metrics
    async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetricsResponse> {
        const org = await this.orgRepository.findById(organizationId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const metrics = await this.metricsRepo.getOrgMetrics(organizationId);

        return {
            organizationId: org.id,
            organizationName: org.name,
            ...metrics,
            walletBalance: org.walletBalance,
        };
    }

    // Task_Sys_11: Get recent audit logs
    async getAuditLogs(limit: number = 100): Promise<AuditLogResponse[]> {
        const logs = await this.auditLogRepo.findRecent(limit);
        return logs.map((log) => ({
            id: log.id,
            action: log.action,
            actorId: log.actorId,
            targetOrgId: log.targetOrgId,
            details: log.details,
            createdAt: log.createdAt,
        }));
    }
}
