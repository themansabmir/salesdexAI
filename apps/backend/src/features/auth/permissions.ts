export type UserRole =
    | 'SUPER_ADMIN'
    | 'MANAGER'
    | 'ADMIN'
    | 'ORG_MANAGER'
    | 'SALES_PERSON';

export enum Permission {
    // Platform Permissions
    MANAGE_ORGANIZATIONS = 'manage:organizations',
    VIEW_PLATFORM_METRICS = 'view:platform_metrics',
    CONFIGURE_SYSTEM = 'configure:system',

    // Organization Permissions
    MANAGE_ORG_SETTINGS = 'manage:org_settings',
    MANAGE_ORG_BILLING = 'manage:org_billing',
    INVITE_MEMBERS = 'invite:members',
    MANAGE_KNOWLEDGE_BASE = 'manage:knowledge_base',
    VIEW_TEAM_ANALYTICS = 'view:team_analytics',
    ATTEND_MEETINGS = 'attend:meetings',
    VIEW_FEEDBACK = 'view:feedback',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
