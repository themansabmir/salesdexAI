// System Configuration Entity - Global platform settings managed by super_admin

export type SystemConfig = {
    id: string;
    key: string;
    value: string | number | boolean;
    description?: string;
    updatedAt: Date;
    updatedBy: string;
};

// Organization-specific feature flags
export type OrganizationFeature = {
    id: string;
    organizationId: string;
    featureKey: string;
    enabled: boolean;
    updatedAt: Date;
    updatedBy: string;
};

// Audit log for system changes
export type SystemAuditLog = {
    id: string;
    action: 'CONFIG_UPDATE' | 'ORG_PAUSE' | 'ORG_UNPAUSE' | 'WALLET_CREDIT' | 'WALLET_DEBIT';
    actorId: string;
    targetOrgId?: string;
    details: Record<string, any>;
    createdAt: Date;
};

// Global system configuration keys
export const SYSTEM_CONFIG_KEYS = {
    PRICING_PER_HOUR: 'pricing_per_hour',
    MAX_CONCURRENT_LIVE_MEETINGS: 'max_concurrent_live_meetings',
    DEFAULT_MOCK_CALL_DISCOUNT: 'default_mock_call_discount',
} as const;

// Feature flag keys
export const FEATURE_KEYS = {
    LIVE_ANALYSIS: 'live_analysis',
    POST_CALL_ANALYSIS: 'post_call_analysis',
    MOCK_CALLS: 'mock_calls',
    KNOWLEDGE_BASE: 'knowledge_base',
} as const;
