import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@/features/auth/domain/auth.entity';
import { getMeApi } from '@/features/auth/infrastructure/auth.api';

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setSession: (payload: { user: User; accessToken: string }) => void;
    logout: () => void;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    const refresh = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setUser(null);
            return;
        }

        const me = await getMeApi();
        setUser(me.user);
    }, []);

    const setSession = useCallback((payload: { user: User; accessToken: string }) => {
        localStorage.setItem('accessToken', payload.accessToken);
        setUser(payload.user);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const hydrate = async () => {
            setIsLoading(true);
            try {
                await refresh();
            } catch {
                if (isMounted) {
                    logout();
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        hydrate();

        return () => {
            isMounted = false;
        };
    }, [logout, refresh]);

    const value = useMemo<AuthContextValue>(() => {
        return {
            user,
            isLoading,
            isAuthenticated: !!user,
            setSession,
            logout,
            refresh,
        };
    }, [user, isLoading, setSession, logout, refresh]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
};
