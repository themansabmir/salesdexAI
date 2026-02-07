import { IAuthRepository } from './auth.repository';
import { IPasswordHasher } from '@/core/ports/password-hasher.port';
import { ITokenService } from '@/core/ports/token.port';
import { LoginRequest, RegisterRequest, AuthResponse } from './auth.dto';
import { User } from './auth.entity';

export class AuthService {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ) { }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.passwordHasher.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const accessToken = this.tokenService.sign({
            sub: user.id,
            email: user.email,
            role: user.platformRole || user.organizationRole,
            orgId: user.organizationId,
        });

        return {
            user: this.mapToResponseUser(user),
            accessToken,
        };
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const existingUser = await this.authRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await this.passwordHasher.hash(data.password);

        const user = await this.authRepository.create({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        const accessToken = this.tokenService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            user: this.mapToResponseUser(user),
            accessToken,
        };
    }

    private mapToResponseUser(user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            platformRole: user.platformRole,
            organizationRole: user.organizationRole,
            organizationId: user.organizationId,
        };
    }
}
