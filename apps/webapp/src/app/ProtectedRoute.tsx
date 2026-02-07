import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/features/auth/application/use-user";
import { ROUTES } from "./routes.config";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { data: user, isLoading } = useUser();
    const isAuthenticated = !!user;

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <>{children}</>;
}
