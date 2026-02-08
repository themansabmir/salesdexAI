import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes.config";
import { UserRole } from "@/features/auth/domain/auth.entity";
import { useAuth } from "@/features/auth/application/auth-context";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
    allowedRoles?: UserRole[];
    requireOrganization?: boolean;
}

export function ProtectedRoute({ 
    children, 
    fallback, 
    allowedRoles,
    requireOrganization = true 
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

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

    // Check if user needs to create an organization
    const isOnOrgCreatePage = location.pathname === ROUTES.ORGANIZATION.CREATE;
    const hasOrganization = user?.organizationId;
    const isSuperAdmin = user?.platformRole === 'SUPER_ADMIN';

    // SUPER_ADMIN doesn't need an organization (platform-level access)
    // If user has no org and isn't on the org create page, redirect them there
    if (requireOrganization && !hasOrganization && !isOnOrgCreatePage && !isSuperAdmin) {
        return <Navigate to={ROUTES.ORGANIZATION.CREATE} replace />;
    }

    // If user has an org and tries to access org creation page, redirect to dashboard
    if (hasOrganization && isOnOrgCreatePage) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && user) {
        const userRoles = [user.platformRole, user.organizationRole].filter(Boolean) as UserRole[];
        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return <Navigate to={ROUTES.DASHBOARD} replace />;
        }
    }

    return <>{children}</>;
}
