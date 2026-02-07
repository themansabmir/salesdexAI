import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // CORS
    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    // JWT
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // SMTP (Nodemailer)
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM_NAME: z.string().default("SalesAi"),
    SMTP_FROM_EMAIL: z.string().default("noreply@salesai.com"),

    // Twilio
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

    // OTP Configuration
    OTP_LENGTH: z.coerce.number().default(6),
    OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(10),
    OTP_MAX_ATTEMPTS: z.coerce.number().default(3),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
    RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const env = {
    ..._env.data,
    isDevelopment: _env.data.NODE_ENV === "development",
    isProduction: _env.data.NODE_ENV === "production",
    isTest: _env.data.NODE_ENV === "test",
} as const;

// For backward compatibility while refactoring
export const config = env;
