import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMyOrganizationApi,
    createOrganizationApi,
    updateOrganizationApi,
    listOrganizationMembersApi,
    updateMemberRoleApi,
    removeMemberApi,
    inviteUserApi,
    listInvitationsApi,
    revokeInvitationApi,
    acceptInvitationApi,
} from '@/features/organization/infrastructure/org.api';

// Query keys factory for consistent cache management
const orgKeys = {
    all: ['organization'] as const,
    members: ['organization-members'] as const,
    invitations: ['organization-invitations'] as const,
};

// Cache configuration - 5 minutes stale time for better performance
const CACHE_CONFIG = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
    retry: 1,
    refetchOnWindowFocus: false,
};

export const useOrganization = () => {
    return useQuery({
        queryKey: orgKeys.all,
        queryFn: getMyOrganizationApi,
        ...CACHE_CONFIG,
    });
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrganizationApi,
        onSuccess: (data) => {
            // Optimistically update cache
            queryClient.setQueryData(orgKeys.all, data);
        },
    });
};

export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrganizationApi,
        onSuccess: (data) => {
            queryClient.setQueryData(orgKeys.all, data);
        },
    });
};

export const useOrganizationMembers = () => {
    return useQuery({
        queryKey: orgKeys.members,
        queryFn: listOrganizationMembersApi,
        ...CACHE_CONFIG,
    });
};

export const useUpdateMemberRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMemberRoleApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orgKeys.members });
        },
    });
};

export const useRemoveMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeMemberApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orgKeys.members });
        },
    });
};

export const useInvitations = () => {
    return useQuery({
        queryKey: orgKeys.invitations,
        queryFn: listInvitationsApi,
        ...CACHE_CONFIG,
    });
};

export const useInviteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: inviteUserApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orgKeys.invitations });
        },
    });
};

export const useRevokeInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: revokeInvitationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orgKeys.invitations });
        },
    });
};

export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: acceptInvitationApi,
        onSuccess: () => {
            // Invalidate both org and auth user data
            queryClient.invalidateQueries({ queryKey: orgKeys.all });
            queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        },
    });
};
