import { apiClient } from '@/lib/api-client';

export type Organization = {
    id: string;
    name: string;
    slug: string;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
    isActive: boolean;
    walletBalance: number;
    currency: string;
    createdAt: Date;
};

export type OrganizationMember = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
    joinedAt: Date;
};

export type Invitation = {
    id: string;
    email: string;
    role: 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
};

export type CreateOrganizationRequest = {
    name: string;
    slug?: string;
};

export type UpdateOrganizationRequest = {
    name?: string;
    isActive?: boolean;
    liveAnalysisEnabled?: boolean;
    mockCallsEnabled?: boolean;
    maxConcurrentCalls?: number;
};

export type CreateInvitationRequest = {
    email: string;
    role: 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
};

export type AcceptInvitationRequest = {
    token: string;
};

export type UpdateMemberRoleRequest = {
    userId: string;
    role: 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
};

export const getMyOrganizationApi = async (): Promise<Organization> => {
    return apiClient.get<Organization>('/organizations/me');
};

export const createOrganizationApi = async (data: CreateOrganizationRequest): Promise<Organization> => {
    return apiClient.post<Organization>('/organizations', data);
};

export const updateOrganizationApi = async (data: UpdateOrganizationRequest): Promise<Organization> => {
    return apiClient.patch<Organization>('/organizations/me', data);
};

export const listOrganizationMembersApi = async (): Promise<OrganizationMember[]> => {
    return apiClient.get<OrganizationMember[]>('/organizations/members');
};

export const updateMemberRoleApi = async (data: UpdateMemberRoleRequest): Promise<OrganizationMember> => {
    return apiClient.patch<OrganizationMember>('/organizations/members/role', data);
};

export const removeMemberApi = async (memberId: string): Promise<void> => {
    return apiClient.delete<void>(`/organizations/members/${memberId}`);
};

export const inviteUserApi = async (data: CreateInvitationRequest): Promise<Invitation> => {
    return apiClient.post<Invitation>('/organizations/invitations', data);
};

export const listInvitationsApi = async (): Promise<Invitation[]> => {
    return apiClient.get<Invitation[]>('/organizations/invitations');
};

export const revokeInvitationApi = async (invitationId: string): Promise<Invitation> => {
    return apiClient.patch<Invitation>(`/organizations/invitations/${invitationId}/revoke`);
};

export const acceptInvitationApi = async (token: string): Promise<Organization> => {
    return apiClient.post<Organization>('/organizations/accept-invite', { token });
};
