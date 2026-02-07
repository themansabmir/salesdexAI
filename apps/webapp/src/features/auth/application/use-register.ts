import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerApi, AuthResponse } from '@/features/auth/infrastructure/auth.api';
import { RegisterInput } from '@/features/auth/domain/auth.schema';

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, RegisterInput>({
        mutationFn: registerApi,
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.setQueryData(['auth-user'], data.user);
        },
    });
};
