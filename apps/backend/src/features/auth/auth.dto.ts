import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export type AuthResponse = {
    user: {
        id: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        platformRole?: string | null;
        organizationRole?: string | null;
        organizationId?: string | null;
    };
    accessToken: string;
};
