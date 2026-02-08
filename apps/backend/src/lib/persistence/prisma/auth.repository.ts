import { PrismaClient } from '@prisma/client';
import { IAuthRepository } from '@/features/auth/auth.repository';
import { User } from '@/features/auth/auth.entity';
import { PlatformRole, OrganizationRole } from '@prisma/client';

export class PrismaAuthRepository implements IAuthRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) return null;
        return this.mapToEntityWithPassword(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async create(data: Partial<User>): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email!,
                password: data.password,
                clerkId: `custom_${Date.now()}`,
                firstName: data.firstName,
                lastName: data.lastName,
                organizationRole: data.organizationRole as OrganizationRole | null,
                platformRole: data.platformRole as PlatformRole | null,
            },
        });
        return this.mapToEntity(user);
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                platformRole: data.platformRole as PlatformRole | null,
                organizationRole: data.organizationRole as OrganizationRole | null,
                organizationId: data.organizationId,
            },
        });
        return this.mapToEntity(user);
    }

    async countUsers(): Promise<number> {
        return this.prisma.user.count();
    }

    private mapToEntity(user: any): User {
        return {
            id: user.id,
            email: user.email,
            // password is intentionally excluded - use findByEmailWithPassword for auth operations
            firstName: user.firstName,
            lastName: user.lastName,
            platformRole: user.platformRole,
            organizationRole: user.organizationRole,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private mapToEntityWithPassword(user: any): User {
        return {
            id: user.id,
            email: user.email,
            password: user.password,
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
