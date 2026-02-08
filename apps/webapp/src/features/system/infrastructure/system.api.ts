import { apiClient } from '@/lib/api-client';

export type SystemConfig = {
    id: string;
    key: string;
    value: string | number | boolean;
    description?: string;
    updatedAt: Date;
};

export type OrgFeature = {
    id: string;
    organizationId: string;
    featureKey: string;
    enabled: boolean;
    updatedAt: Date;
};

export type AuditLog = {
    id: string;
    action: string;
    actorId: string;
    actorEmail?: string;
    targetOrgId?: string;
    targetOrgName?: string;
    details: Record<string, any>;
    createdAt: Date;
};

export type GlobalMetrics = {
    totalOrganizations: number;
    totalUsers: number;
    activeMeetings: number;
    totalUsageHours: number;
    totalRevenue: number;
};

export type OrgMetrics = {
    organizationId: string;
    organizationName: string;
    totalMeetings: number;
    totalUsageHours: number;
    totalCost: number;
    activeUsers: number;
    walletBalance: number;
};

export type WalletAdjustment = {
    amount: number;
    reason: string;
};

export type WalletTransaction = {
    id: string;
    organizationId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    processedBy: string;
    createdAt: Date;
};

// System config APIs
export const getSystemConfigApi = async (): Promise<SystemConfig[]> => {
    return apiClient.get<SystemConfig[]>('/system/config');
};

export const updateSystemConfigApi = async (data: {
    key: string;
    value: string | number | boolean;
    description?: string;
}): Promise<SystemConfig> => {
    return apiClient.patch<SystemConfig>('/system/config', data);
};

// Metrics APIs
export const getGlobalMetricsApi = async (): Promise<GlobalMetrics> => {
    return apiClient.get<GlobalMetrics>('/system/metrics');
};

export const getOrgMetricsApi = async (orgId: string): Promise<OrgMetrics> => {
    return apiClient.get<OrgMetrics>(`/system/organizations/${orgId}/metrics`);
};

// Feature flags APIs
export const getOrgFeaturesApi = async (orgId: string): Promise<OrgFeature[]> => {
    return apiClient.get<OrgFeature[]>(`/system/organizations/${orgId}/features`);
};

export const updateOrgFeatureApi = async (data: {
    organizationId: string;
    featureKey: string;
    enabled: boolean;
}): Promise<OrgFeature> => {
    return apiClient.patch<OrgFeature>('/system/organizations/features', data);
};

// Audit logs API
export const getAuditLogsApi = async (limit?: number): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>('/system/audit-logs', {
        params: { limit },
    });
};

// Wallet APIs
export const creditWalletApi = async (
    orgId: string,
    data: WalletAdjustment
): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(`/organizations/${orgId}/wallet/credit`, data);
};

export const debitWalletApi = async (
    orgId: string,
    data: WalletAdjustment
): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(`/organizations/${orgId}/wallet/debit`, data);
};
