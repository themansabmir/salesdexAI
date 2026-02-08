import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSystemConfigApi,
    updateSystemConfigApi,
    getGlobalMetricsApi,
    getOrgMetricsApi,
    getOrgFeaturesApi,
    updateOrgFeatureApi,
    getAuditLogsApi,
    creditWalletApi,
    debitWalletApi,
} from '@/features/system/infrastructure/system.api';

// Query keys
const systemKeys = {
    all: ['system'] as const,
    config: ['system', 'config'] as const,
    metrics: ['system', 'metrics'] as const,
    orgMetrics: (orgId: string) => ['system', 'metrics', orgId] as const,
    features: (orgId: string) => ['system', 'features', orgId] as const,
    auditLogs: ['system', 'audit-logs'] as const,
};

// System config hooks
export const useSystemConfig = () => {
    return useQuery({
        queryKey: systemKeys.config,
        queryFn: getSystemConfigApi,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSystemConfigApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemKeys.config });
        },
    });
};

// Metrics hooks
export const useGlobalMetrics = () => {
    return useQuery({
        queryKey: systemKeys.metrics,
        queryFn: getGlobalMetricsApi,
        staleTime: 60 * 1000,
    });
};

export const useOrgMetrics = (orgId: string) => {
    return useQuery({
        queryKey: systemKeys.orgMetrics(orgId),
        queryFn: () => getOrgMetricsApi(orgId),
        staleTime: 60 * 1000,
        enabled: !!orgId,
    });
};

// Feature flags hooks
export const useOrgFeatures = (orgId: string) => {
    return useQuery({
        queryKey: systemKeys.features(orgId),
        queryFn: () => getOrgFeaturesApi(orgId),
        staleTime: 5 * 60 * 1000,
        enabled: !!orgId,
    });
};

export const useUpdateOrgFeature = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrgFeatureApi,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: systemKeys.features(variables.organizationId) });
        },
    });
};

// Audit logs hook
export const useAuditLogs = (limit?: number) => {
    return useQuery({
        queryKey: [...systemKeys.auditLogs, limit],
        queryFn: () => getAuditLogsApi(limit),
        staleTime: 30 * 1000,
    });
};

// Wallet hooks
export const useCreditWallet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orgId, data }: { orgId: string; data: { amount: number; reason: string } }) =>
            creditWalletApi(orgId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: systemKeys.orgMetrics(variables.orgId) });
        },
    });
};

export const useDebitWallet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orgId, data }: { orgId: string; data: { amount: number; reason: string } }) =>
            debitWalletApi(orgId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: systemKeys.orgMetrics(variables.orgId) });
        },
    });
};
