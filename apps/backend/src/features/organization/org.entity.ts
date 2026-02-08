// Inline enum definitions (Prisma $Enums issue workaround)
export const OrganizationStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED'
} as const;
export type OrganizationStatus = typeof OrganizationStatus[keyof typeof OrganizationStatus];

export type Organization = {
    id: string;
    name: string;
    slug: string;
    status: OrganizationStatus;
    isActive: boolean;
    walletBalance: number;
    currency: string;
    liveAnalysisEnabled: boolean;
    mockCallsEnabled: boolean;
    maxConcurrentCalls: number;
    createdAt: Date;
    updatedAt: Date;
};
