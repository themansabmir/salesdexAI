import { z } from 'zod';

// Update system config DTO
export const UpdateSystemConfigSchema = z.object({
    key: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
    description: z.string().optional(),
});

export type UpdateSystemConfigRequest = z.infer<typeof UpdateSystemConfigSchema>;

// Update organization feature flag DTO
export const UpdateOrgFeatureSchema = z.object({
    organizationId: z.string().uuid(),
    featureKey: z.string().min(1),
    enabled: z.boolean(),
});

export type UpdateOrgFeatureRequest = z.infer<typeof UpdateOrgFeatureSchema>;

// Manual wallet adjustment DTO
export const WalletAdjustmentSchema = z.object({
    amount: z.number().positive(), // Always positive, direction determined by endpoint
    reason: z.string().min(1).max(500),
});

export type WalletAdjustmentRequest = z.infer<typeof WalletAdjustmentSchema>;

// Response DTOs
export type SystemConfigResponse = {
    id: string;
    key: string;
    value: string | number | boolean;
    description?: string;
    updatedAt: Date;
};

export type OrgFeatureResponse = {
    id: string;
    organizationId: string;
    featureKey: string;
    enabled: boolean;
    updatedAt: Date;
};

export type AuditLogResponse = {
    id: string;
    action: string;
    actorId: string;
    actorEmail?: string;
    targetOrgId?: string;
    targetOrgName?: string;
    details: Record<string, any>;
    createdAt: Date;
};

export type GlobalMetricsResponse = {
    totalOrganizations: number;
    totalUsers: number;
    activeMeetings: number;
    totalUsageHours: number;
    totalRevenue: number;
};

export type OrganizationMetricsResponse = {
    organizationId: string;
    organizationName: string;
    totalMeetings: number;
    totalUsageHours: number;
    totalCost: number;
    activeUsers: number;
    walletBalance: number;
};
