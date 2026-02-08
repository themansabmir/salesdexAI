import { IOrganizationRepository, IInvitationRepository } from './org.repository';
import {
    CreateOrganizationRequest,
    UpdateOrganizationRequest,
    OrganizationResponse,
    UpdateOrganizationStatusRequest,
    CreateInvitationRequest,
    InvitationResponse,
    OrganizationMemberResponse,
    UpdateMemberRoleRequest,
} from './org.dto';
import { IAuthRepository } from '@/features/auth/auth.repository';
import { Organization } from './org.entity';
import { prisma } from '@/lib/prisma';
import { Invitation } from './invitation.entity';
import crypto from 'crypto';

export class OrganizationService {
    constructor(
        private readonly orgRepository: IOrganizationRepository,
        private readonly authRepository: IAuthRepository,
        private readonly invitationRepository?: IInvitationRepository,
    ) { }

    async createOrganization(userId: string, data: CreateOrganizationRequest): Promise<OrganizationResponse> {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }

            if (user.organizationId) {
                throw new Error('User already belongs to an organization');
            }

            const slug = data.slug || this.generateSlug(data.name);

            const existingOrg = await tx.organization.findUnique({ where: { slug } });
            if (existingOrg) {
                throw new Error('Organization with this slug already exists');
            }

            const org = await tx.organization.create({
                data: {
                    name: data.name,
                    slug: slug,
                    walletBalance: 0,
                    currency: 'USD',
                    isActive: true,
                    liveAnalysisEnabled: true,
                    mockCallsEnabled: true,
                    maxConcurrentCalls: 5
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    organizationId: org.id,
                    organizationRole: 'ADMIN'
                }
            });

            return this.mapToResponse({
                id: org.id,
                name: org.name,
                slug: org.slug,
                status: 'ACTIVE',
                isActive: org.isActive,
                walletBalance: Number(org.walletBalance),
                currency: org.currency,
                liveAnalysisEnabled: org.liveAnalysisEnabled,
                mockCallsEnabled: org.mockCallsEnabled,
                maxConcurrentCalls: org.maxConcurrentCalls,
                createdAt: org.createdAt,
                updatedAt: org.updatedAt
            } as Organization);
        });
    }

    async getMyOrganization(userId: string): Promise<OrganizationResponse> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        const org = await this.orgRepository.findById(user.organizationId);
        if (!org) {
            throw new Error('Organization not found');
        }

        return this.mapToResponse(org);
    }

    async updateOrganization(userId: string, data: UpdateOrganizationRequest): Promise<OrganizationResponse> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can update settings');
        }

        const org = await this.orgRepository.update(user.organizationId, data);
        return this.mapToResponse(org);
    }

    async updateOrganizationStatus(userId: string, data: UpdateOrganizationStatusRequest): Promise<OrganizationResponse> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.platformRole !== 'SUPER_ADMIN') {
            throw new Error('Forbidden: Only super admins can change organization status');
        }

        const org = await this.orgRepository.updateStatus(user.organizationId, data.status);
        return this.mapToResponse(org);
    }

    async inviteUser(userId: string, data: CreateInvitationRequest): Promise<InvitationResponse> {
        if (!this.invitationRepository) {
            throw new Error('Invitation repository not configured');
        }

        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can invite users');
        }

        const existingUser = await this.authRepository.findByEmail(data.email);
        if (existingUser?.organizationId) {
            throw new Error('User already belongs to an organization');
        }

        const existingInvite = await this.invitationRepository.findByEmailAndOrg(data.email, user.organizationId);
        if (existingInvite) {
            throw new Error('Pending invitation already exists for this email');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await this.invitationRepository.create({
            organizationId: user.organizationId,
            email: data.email,
            role: data.role as any,
            token,
            expiresAt,
            invitedBy: userId,
        });

        await this.sendInvitationEmail(invitation.email, invitation.token, invitation.role);

        return this.mapInvitationToResponse(invitation);
    }

    async acceptInvitation(token: string, userId: string): Promise<OrganizationResponse> {
        if (!this.invitationRepository) {
            throw new Error('Invitation repository not configured');
        }

        const invitation = await this.invitationRepository.findByToken(token);
        if (!invitation) {
            throw new Error('Invalid invitation token');
        }

        if (invitation.status !== 'PENDING') {
            throw new Error(`Invitation is ${invitation.status.toLowerCase()}`);
        }

        if (new Date() > invitation.expiresAt) {
            await this.invitationRepository.expireOldInvitations();
            throw new Error('Invitation has expired');
        }

        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.organizationId) {
            throw new Error('User already belongs to an organization');
        }

        await prisma.$transaction(async (tx) => {
            await this.invitationRepository!.accept(invitation.id, userId);
            
            await tx.user.update({
                where: { id: userId },
                data: {
                    organizationId: invitation.organizationId,
                    organizationRole: invitation.role as any,
                }
            });
        });

        const org = await this.orgRepository.findById(invitation.organizationId);
        if (!org) {
            throw new Error('Organization not found');
        }

        return this.mapToResponse(org);
    }

    async listOrganizationMembers(userId: string): Promise<OrganizationMemberResponse[]> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        const members = await prisma.user.findMany({
            where: { organizationId: user.organizationId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                organizationRole: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return members.map(m => ({
            id: m.id,
            email: m.email,
            firstName: m.firstName || undefined,
            lastName: m.lastName || undefined,
            role: m.organizationRole as any,
            joinedAt: m.createdAt,
        }));
    }

    async updateMemberRole(userId: string, data: UpdateMemberRoleRequest): Promise<OrganizationMemberResponse> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can update member roles');
        }

        const targetUser = await this.authRepository.findById(data.userId);
        if (!targetUser || targetUser.organizationId !== user.organizationId) {
            throw new Error('Member not found in organization');
        }

        if (targetUser.organizationRole === 'ADMIN' && data.role !== 'ADMIN') {
            const adminCount = await prisma.user.count({
                where: {
                    organizationId: user.organizationId,
                    organizationRole: 'ADMIN',
                },
            });

            if (adminCount <= 1) {
                throw new Error('Cannot demote the last admin. Promote another member to admin first.');
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: data.userId },
            data: { organizationRole: data.role as any },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                organizationRole: true,
                createdAt: true,
            },
        });

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName || undefined,
            lastName: updatedUser.lastName || undefined,
            role: updatedUser.organizationRole as any,
            joinedAt: updatedUser.createdAt,
        };
    }

    async removeMember(userId: string, memberId: string): Promise<void> {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can remove members');
        }

        const targetUser = await this.authRepository.findById(memberId);
        if (!targetUser || targetUser.organizationId !== user.organizationId) {
            throw new Error('Member not found in organization');
        }

        if (targetUser.organizationRole === 'ADMIN') {
            const adminCount = await prisma.user.count({
                where: {
                    organizationId: user.organizationId,
                    organizationRole: 'ADMIN',
                },
            });

            if (adminCount <= 1) {
                throw new Error('Cannot remove the last admin. Promote another member to admin first.');
            }
        }

        await prisma.user.update({
            where: { id: memberId },
            data: {
                organizationId: null,
                organizationRole: null,
            },
        });
    }

    async listInvitations(userId: string): Promise<InvitationResponse[]> {
        if (!this.invitationRepository) {
            return [];
        }

        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can view invitations');
        }

        const invitations = await this.invitationRepository.findByOrganization(user.organizationId);
        return invitations.map(i => this.mapInvitationToResponse(i));
    }

    async revokeInvitation(userId: string, invitationId: string): Promise<InvitationResponse> {
        if (!this.invitationRepository) {
            throw new Error('Invitation repository not configured');
        }

        const user = await this.authRepository.findById(userId);
        if (!user || !user.organizationId) {
            throw new Error('User is not associated with any organization');
        }

        if (user.organizationRole !== 'ADMIN') {
            throw new Error('Forbidden: Only organization admins can revoke invitations');
        }

        const invitation = await this.invitationRepository.revoke(invitationId, userId);
        return this.mapInvitationToResponse(invitation);
    }

    private async sendInvitationEmail(email: string, token: string, role: string): Promise<void> {
        console.log(`[EMAIL] Invitation sent to ${email} with token ${token} for role ${role}`);
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    private mapToResponse(org: Organization): OrganizationResponse {
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            status: org.status,
            isActive: org.isActive,
            walletBalance: org.walletBalance,
            currency: org.currency,
            createdAt: org.createdAt
        };
    }

    private mapInvitationToResponse(invitation: Invitation): InvitationResponse {
        return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            acceptedAt: invitation.acceptedAt,
            createdAt: invitation.createdAt,
        };
    }
}
