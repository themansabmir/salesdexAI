import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.dto';

export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
        // This assumes the auth middleware attached the user to the request
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        res.json({ user });
    };
}
