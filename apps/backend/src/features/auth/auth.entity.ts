export type UserRole =
    | 'SUPER_ADMIN'
    | 'MANAGER'
    | 'ADMIN'
    | 'ORG_MANAGER'
    | 'SALES_PERSON';
export type User = {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    platformRole?: UserRole | null;
    organizationRole?: UserRole | null;
    organizationId?: string | null;
    createdAt: Date;
    updatedAt: Date;
};
