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
        return this.mapToEntity(user);
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
                clerkId: `custom_${Date.now()}`, // Placeholder since we're using custom JWT
                firstName: data.firstName,
                lastName: data.lastName,
                organizationRole: data.organizationRole as OrganizationRole | null,
                platformRole: data.platformRole as PlatformRole | null,
            },
        });
        return this.mapToEntity(user);
    }

    private mapToEntity(user: any): User {
        return {
            id: user.id,
            email: user.email,
            password: user.password, // In a real app, you might have a password field in Prisma
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
