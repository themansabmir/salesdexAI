import { prisma } from '@/lib/prisma';
import { PrismaAuthRepository } from '@/lib/persistence/prisma/auth.repository';
import { BcryptHasher } from '@/lib/crypto/bcrypt-hasher.service';
import { JwtTokenService } from '@/lib/jwt/jwt-token.service';
import { AuthService } from '@/features/auth/auth.service';
import { AuthController } from '@/features/auth/auth.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';

// Instantiate infrastructure
export const passwordHasher = new BcryptHasher();
export const tokenService = new JwtTokenService();

// Auth Feature
export const authRepository = new PrismaAuthRepository(prisma);
export const authService = new AuthService(authRepository, passwordHasher, tokenService);
export const authController = new AuthController(authService, authRepository);

// Organization Feature
import { PrismaOrganizationRepository, PrismaInvitationRepository } from '@/lib/persistence/prisma/org.repository';
import { OrganizationService } from '@/features/organization/org.service';
import { OrganizationController } from '@/features/organization/org.controller';

export const orgRepository = new PrismaOrganizationRepository(prisma);
export const invitationRepository = new PrismaInvitationRepository(prisma);
export const orgService = new OrganizationService(orgRepository, authRepository, invitationRepository);
export const orgController = new OrganizationController(orgService);

// User Feature
import { PrismaUserRepository } from '@/lib/persistence/prisma/user.repository';
import { UserService } from '@/features/user/user.service';
import { UserController } from '@/features/user/user.controller';

export const userRepository = new PrismaUserRepository(prisma);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

// Middleware
export const authMiddleware = createAuthMiddleware(tokenService);
