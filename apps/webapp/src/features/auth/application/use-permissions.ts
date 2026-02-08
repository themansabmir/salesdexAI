import { useUser } from "./use-user";
import { UserRole } from "../domain/auth.entity";

// This should match the backend permissions
export enum Permission {
    MANAGE_ORGANIZATIONS = 'manage:organizations',
    VIEW_PLATFORM_METRICS = 'view:platform_metrics',
    CONFIGURE_SYSTEM = 'configure:system',
    MANAGE_ORG_SETTINGS = 'manage:org_settings',
    MANAGE_ORG_BILLING = 'manage:org_billing',
    INVITE_MEMBERS = 'invite:members',
    MANAGE_KNOWLEDGE_BASE = 'manage:knowledge_base',
    VIEW_TEAM_ANALYTICS = 'view:team_analytics',
    ATTEND_MEETINGS = 'attend:meetings',
    VIEW_FEEDBACK = 'view:feedback',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission),
    MANAGER: [
        Permission.MANAGE_ORGANIZATIONS,
        Permission.VIEW_PLATFORM_METRICS,
        Permission.VIEW_TEAM_ANALYTICS,
    ],
    ADMIN: [
        Permission.MANAGE_ORG_SETTINGS,
        Permission.MANAGE_ORG_BILLING,
        Permission.INVITE_MEMBERS,
        Permission.MANAGE_KNOWLEDGE_BASE,
        Permission.VIEW_TEAM_ANALYTICS,
        Permission.ATTEND_MEETINGS,
        Permission.VIEW_FEEDBACK,
    ],
    ORG_MANAGER: [
        Permission.VIEW_TEAM_ANALYTICS,
        Permission.ATTEND_MEETINGS,
        Permission.VIEW_FEEDBACK,
    ],
    SALES_PERSON: [
        Permission.ATTEND_MEETINGS,
        Permission.VIEW_FEEDBACK,
    ],
};

export const usePermissions = () => {
    const { data: user } = useUser();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;

        const platformRole = user.platformRole;
        const orgRole = user.organizationRole;

        const platformPermissions = platformRole ? ROLE_PERMISSIONS[platformRole] || [] : [];
        const orgPermissions = orgRole ? ROLE_PERMISSIONS[orgRole] || [] : [];

        const allPermissions = new Set([...platformPermissions, ...orgPermissions]);

        return allPermissions.has(permission);
    };

    const hasRole = (role: UserRole): boolean => {
        if (!user) return false;
        return user.platformRole === role || user.organizationRole === role;
    };

    return { hasPermission, hasRole, roles: [user?.platformRole, user?.organizationRole].filter(Boolean) as UserRole[] };
};
