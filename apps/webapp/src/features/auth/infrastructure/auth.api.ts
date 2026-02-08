import { apiClient } from '@/lib/api-client';
import { User } from '@/features/auth/domain/auth.entity';
import { LoginInput, RegisterInput } from '@/features/auth/domain/auth.schema';

export type AuthResponse = {
    user: User;
    accessToken: string;
};

export const loginApi = async (data: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
};

export const registerApi = async (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
};

export const getMeApi = async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/me');
};
