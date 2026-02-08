import { Organization as PrismaOrg, PrismaClient, OrganizationRole } from '@prisma/client';
import { IOrganizationRepository, IInvitationRepository } from '@/features/organization/org.repository';
import { Organization, OrganizationStatus } from '@/features/organization/org.entity';
import { Invitation } from '@/features/organization/invitation.entity';

export class PrismaOrganizationRepository implements IOrganizationRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Organization | null> {
        const org = await this.prisma.organization.findUnique({
            where: { id },
        });
        return org ? this.mapToEntity(org as any) : null;
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        const org = await this.prisma.organization.findUnique({
            where: { slug },
        });
        return org ? this.mapToEntity(org as any) : null;
    }

    async create(data: Partial<Organization>): Promise<Organization> {
        const org = await this.prisma.organization.create({
            data: {
                name: data.name!,
                slug: data.slug!,
                walletBalance: data.walletBalance || 0,
                currency: data.currency || 'USD',
                isActive: true,
            } as any,
        });
        return this.mapToEntity(org as any);
    }

    async update(id: string, data: Partial<Organization>): Promise<Organization> {
        const org = await this.prisma.organization.update({
            where: { id },
            data: {
                name: data.name,
                isActive: data.isActive,
                liveAnalysisEnabled: data.liveAnalysisEnabled,
                mockCallsEnabled: data.mockCallsEnabled,
                maxConcurrentCalls: data.maxConcurrentCalls,
                walletBalance: data.walletBalance,
            } as any,
        });
        return this.mapToEntity(org as any);
    }

    async updateStatus(id: string, status: OrganizationStatus): Promise<Organization> {
        const org = await this.prisma.organization.update({
            where: { id },
            data: {
                isActive: status === 'ACTIVE',
            } as any,
        });
        return this.mapToEntity({ ...org, status } as any);
    }

    async list(query: any): Promise<Organization[]> {
        const orgs = await this.prisma.organization.findMany({
            where: query,
        });
        return orgs.map(org => this.mapToEntity(org as any));
    }

    private mapToEntity(org: any): Organization {
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            status: org.status || 'ACTIVE',
            isActive: org.isActive,
            walletBalance: Number(org.walletBalance),
            currency: org.currency,
            liveAnalysisEnabled: org.liveAnalysisEnabled,
            mockCallsEnabled: org.mockCallsEnabled,
            maxConcurrentCalls: org.maxConcurrentCalls,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
        };
    }
}

export class PrismaInvitationRepository implements IInvitationRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: {
        organizationId: string;
        email: string;
        role: OrganizationRole;
        token: string;
        expiresAt: Date;
        invitedBy: string;
    }): Promise<Invitation> {
        const invite = await (this.prisma as any).organizationInvitation.create({
            data: {
                organizationId: data.organizationId,
                email: data.email,
                role: data.role,
                token: data.token,
                expiresAt: data.expiresAt,
                invitedBy: data.invitedBy,
                status: 'PENDING',
            },
        });
        return this.mapToEntity(invite);
    }

    async findByToken(token: string): Promise<Invitation | null> {
        const invite = await (this.prisma as any).organizationInvitation.findUnique({
            where: { token },
            include: { organization: true },
        });
        return invite ? this.mapToEntity(invite) : null;
    }

    async findByEmailAndOrg(email: string, organizationId: string): Promise<Invitation | null> {
        const invite = await (this.prisma as any).organizationInvitation.findFirst({
            where: {
                email,
                organizationId,
                status: 'PENDING',
            },
        });
        return invite ? this.mapToEntity(invite) : null;
    }

    async findByOrganization(organizationId: string): Promise<Invitation[]> {
        const invites = await (this.prisma as any).organizationInvitation.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
        return invites.map((i: any) => this.mapToEntity(i));
    }

    async accept(id: string, userId: string): Promise<Invitation> {
        const invite = await (this.prisma as any).organizationInvitation.update({
            where: { id },
            data: {
                status: 'ACCEPTED',
                acceptedAt: new Date(),
                acceptedByUserId: userId,
            },
        });
        return this.mapToEntity(invite);
    }

    async revoke(id: string, revokedBy: string): Promise<Invitation> {
        const invite = await (this.prisma as any).organizationInvitation.update({
            where: { id },
            data: {
                status: 'REVOKED',
                revokedBy,
                revokedAt: new Date(),
            },
        });
        return this.mapToEntity(invite);
    }

    async expireOldInvitations(): Promise<number> {
        const result = await (this.prisma as any).organizationInvitation.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: new Date() },
            },
            data: {
                status: 'EXPIRED',
            },
        });
        return result.count;
    }

    private mapToEntity(invite: any): Invitation {
        return {
            id: invite.id,
            organizationId: invite.organizationId,
            organization: invite.organization ? {
                id: invite.organization.id,
                name: invite.organization.name,
                slug: invite.organization.slug,
            } : undefined,
            email: invite.email,
            role: invite.role as OrganizationRole,
            token: invite.token,
            status: invite.status as any,
            expiresAt: invite.expiresAt,
            acceptedAt: invite.acceptedAt || undefined,
            acceptedByUserId: invite.acceptedByUserId || undefined,
            invitedBy: invite.invitedBy,
            revokedBy: invite.revokedBy || undefined,
            revokedAt: invite.revokedAt || undefined,
            createdAt: invite.createdAt,
            updatedAt: invite.updatedAt,
        };
    }
}
