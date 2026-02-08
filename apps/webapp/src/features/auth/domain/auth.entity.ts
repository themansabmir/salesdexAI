export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';

export type User = {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    platformRole?: UserRole | null;
    organizationRole?: UserRole | null;
    organizationId?: string | null;
};

export type AuthState = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
};
