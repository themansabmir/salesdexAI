import { Organization, OrganizationStatus } from './org.entity';
import { Invitation } from './invitation.entity';
import { OrganizationRole } from '@prisma/client';

export interface IOrganizationRepository {
    findById(id: string): Promise<Organization | null>;
    findBySlug(slug: string): Promise<Organization | null>;
    create(data: Partial<Organization>): Promise<Organization>;
    update(id: string, data: Partial<Organization>): Promise<Organization>;
    updateStatus(id: string, status: OrganizationStatus): Promise<Organization>;
    list(query: any): Promise<Organization[]>;
}

export interface IInvitationRepository {
    create(data: {
        organizationId: string;
        email: string;
        role: OrganizationRole;
        token: string;
        expiresAt: Date;
        invitedBy: string;
    }): Promise<Invitation>;
    findByToken(token: string): Promise<Invitation | null>;
    findByEmailAndOrg(email: string, organizationId: string): Promise<Invitation | null>;
    findByOrganization(organizationId: string): Promise<Invitation[]>;
    accept(id: string, userId: string): Promise<Invitation>;
    revoke(id: string, revokedBy: string): Promise<Invitation>;
    expireOldInvitations(): Promise<number>;
}
