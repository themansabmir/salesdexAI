import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('accessToken');
        queryClient.setQueryData(['auth-user'], null);
        queryClient.removeQueries();
        navigate('/login');
    };

    return { logout };
};
