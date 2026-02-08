import { IUserRepository } from './user.repository';
import { UserRole } from '@/features/auth/permissions';
import { User } from '@/features/auth/auth.entity';

export class UserService {
    constructor(private readonly userRepository: IUserRepository) { }

    async updateUserRole(id: string, platformRole?: UserRole | null, organizationRole?: UserRole | null): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.userRepository.updateRole(id, platformRole, organizationRole);
    }

    async getUser(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async listUsers(limit?: number, offset?: number): Promise<User[]> {
        return this.userRepository.list(limit, offset);
    }
}
