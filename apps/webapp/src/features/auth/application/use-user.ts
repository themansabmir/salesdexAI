import { useQuery } from '@tanstack/react-query';
import { getMeApi } from '@/features/auth/infrastructure/auth.api';
import { User } from '@/features/auth/domain/auth.entity';

export const useUser = () => {
    const token = localStorage.getItem('accessToken');

    return useQuery<User, Error>({
        queryKey: ['auth-user'],
        queryFn: async () => {
            const data = await getMeApi();
            return data.user;
        },
        enabled: !!token,
        retry: false,
        staleTime: Infinity, // Keep user data as long as session is valid
    });
};
