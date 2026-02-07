import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROUTES } from "./routes.config";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <>{children}</>;
}
