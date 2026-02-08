import { z } from 'zod';

// Inline enum definitions (Prisma $Enums issue workaround)
export const OrganizationStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED'
} as const;
export type OrganizationStatus = typeof OrganizationStatus[keyof typeof OrganizationStatus];

export const OrganizationRole = {
  ADMIN: 'ADMIN',
  ORG_MANAGER: 'ORG_MANAGER',
  SALES_PERSON: 'SALES_PERSON'
} as const;
export type OrganizationRole = typeof OrganizationRole[keyof typeof OrganizationRole];

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
} as const;
export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

export const CreateOrganizationSchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(50).optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
    liveAnalysisEnabled: z.boolean().optional(),
    mockCallsEnabled: z.boolean().optional(),
    maxConcurrentCalls: z.number().optional(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationSchema>;

export const UpdateOrganizationStatusSchema = z.object({
    status: z.enum([OrganizationStatus.ACTIVE, OrganizationStatus.PAUSED, OrganizationStatus.ARCHIVED]),
});

export type UpdateOrganizationStatusRequest = z.infer<typeof UpdateOrganizationStatusSchema>;

// Invitation DTOs
export const CreateInvitationSchema = z.object({
    email: z.string().email(),
    role: z.enum([OrganizationRole.ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.SALES_PERSON]),
});

export type CreateInvitationRequest = z.infer<typeof CreateInvitationSchema>;

export const AcceptInvitationSchema = z.object({
    token: z.string(),
});

export type AcceptInvitationRequest = z.infer<typeof AcceptInvitationSchema>;

export type InvitationResponse = {
    id: string;
    email: string;
    role: OrganizationRole;
    status: InvitationStatus;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
};

// Member management DTOs
export const UpdateMemberRoleSchema = z.object({
    userId: z.string(),
    role: z.enum([OrganizationRole.ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.SALES_PERSON]),
});

export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleSchema>;

export type OrganizationMemberResponse = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: OrganizationRole;
    joinedAt: Date;
};

export type OrganizationResponse = {
    id: string;
    name: string;
    slug: string;
    status: OrganizationStatus;
    isActive: boolean;
    walletBalance: number;
    currency: string;
    createdAt: Date;
};
