import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.dto';
import { IAuthRepository } from './auth.repository';

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authRepository: IAuthRepository
    ) { }

    login = async (req: Request, res: Response) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.authService.login(validatedData);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Login failed' });
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await this.authService.register(validatedData);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Registration failed' });
        }
    };

    getMe = async (req: Request, res: Response) => {
        try {
            const tokenUser = (req as any).user;
            if (!tokenUser?.sub) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            
            // Fetch fresh user data from database
            const user = await this.authRepository.findById(tokenUser.sub);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json({ user });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to get user' });
        }
    };
}
