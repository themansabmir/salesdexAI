import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/features/user/user.repository';
import { User, UserRole } from '@/features/auth/auth.entity'; // Reusing User entity from auth for consistency
import { PlatformRole, OrganizationRole } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.mapToEntity(user) : null;
    }

    async updateRole(id: string, platformRole?: UserRole | null, organizationRole?: UserRole | null): Promise<User> {
        const data: any = {};
        if (platformRole !== undefined) data.platformRole = platformRole as PlatformRole | null;
        if (organizationRole !== undefined) data.organizationRole = organizationRole as OrganizationRole | null;

        const user = await this.prisma.user.update({
            where: { id },
            data,
        });
        return this.mapToEntity(user);
    }

    async list(limit: number = 20, offset: number = 0): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return users.map(u => this.mapToEntity(u));
    }

    private mapToEntity(user: any): User {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            platformRole: user.platformRole,
            organizationRole: user.organizationRole,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
