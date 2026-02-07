import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi, AuthResponse } from '@/features/auth/infrastructure/auth.api';
import { LoginInput } from '@/features/auth/domain/auth.schema';

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: loginApi,
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.setQueryData(['auth-user'], data.user);
        },
    });
};
