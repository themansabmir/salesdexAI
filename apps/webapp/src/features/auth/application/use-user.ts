import { useQuery } from '@tanstack/react-query';
import { getMeApi } from '@/features/auth/infrastructure/auth.api';
import { User } from '@/features/auth/domain/auth.entity';

export const useUser = () => {
    return useQuery<User, Error>({
        queryKey: ['auth-user'],
        queryFn: async () => {
            const data = await getMeApi();
            return data.user;
        },
        retry: false,
        staleTime: Infinity,
    });
};
