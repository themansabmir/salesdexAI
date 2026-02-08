import { UserRole } from '@/features/auth/permissions';
import { User } from '@/features/auth/auth.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    updateRole(id: string, platformRole?: UserRole | null, organizationRole?: UserRole | null): Promise<User>;
    list(limit?: number, offset?: number): Promise<User[]>;
}
