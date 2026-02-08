import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi, AuthResponse } from '@/features/auth/infrastructure/auth.api';
import { LoginInput } from '@/features/auth/domain/auth.schema';
import { useAuth } from '@/features/auth/application/auth-context';

export const useLogin = () => {
    const queryClient = useQueryClient();
    const { setSession } = useAuth();

    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: loginApi,
        onSuccess: (data) => {
            setSession({ user: data.user, accessToken: data.accessToken });
            queryClient.setQueryData(['auth-user'], data.user);
        },
    });
};
