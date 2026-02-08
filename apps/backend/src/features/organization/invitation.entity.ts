// Inline type definitions (Prisma import issue workaround)
export type OrganizationRole = 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export type Invitation = {
    id: string;
    organizationId: string;
    organization?: {
        id: string;
        name: string;
        slug: string;
    };
    email: string;
    role: OrganizationRole;
    token: string;
    status: InvitationStatus;
    expiresAt: Date;
    acceptedAt?: Date;
    acceptedByUserId?: string;
    invitedBy: string;
    revokedBy?: string;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};
