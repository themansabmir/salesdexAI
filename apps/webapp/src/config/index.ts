import { z } from 'zod';

const envSchema = z.object({
    VITE_API_URL: z.string().default('/api'),
    VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
}

export const config = {
    api: {
        baseUrl: _env.success ? _env.data.VITE_API_URL : '/api',
    },
    auth: {
        clerkKey: _env.success ? _env.data.VITE_CLERK_PUBLISHABLE_KEY : undefined,
    },
} as const;
