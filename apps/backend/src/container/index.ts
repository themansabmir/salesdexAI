import { PrismaClient } from '@prisma/client';
import { PrismaAuthRepository } from '@/lib/persistence/prisma/auth.repository';
import { BcryptHasher } from '@/lib/crypto/bcrypt-hasher.service';
import { JwtTokenService } from '@/lib/jwt/jwt-token.service';
import { AuthService } from '@/features/auth/auth.service';
import { AuthController } from '@/features/auth/auth.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';

// Instantiate infrastructure
export const prisma = new PrismaClient();
export const passwordHasher = new BcryptHasher();
export const tokenService = new JwtTokenService();

// Auth Feature
export const authRepository = new PrismaAuthRepository(prisma);
export const authService = new AuthService(authRepository, passwordHasher, tokenService);
export const authController = new AuthController(authService);

// Middleware
export const authMiddleware = createAuthMiddleware(tokenService);
