import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/application/auth-context';

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const auth = useAuth();

    const logout = () => {
        auth.logout();
        queryClient.setQueryData(['auth-user'], null);
        queryClient.removeQueries();
        navigate('/login');
    };

    return { logout };
};
