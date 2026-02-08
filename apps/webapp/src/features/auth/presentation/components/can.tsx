import { ReactNode } from 'react';
import { Permission, usePermissions } from '../../application/use-permissions';
import { UserRole } from '../../domain/auth.entity';

interface CanProps {
    permission?: Permission;
    role?: UserRole;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Can = ({ permission, role, children, fallback = null }: CanProps) => {
    const { hasPermission, hasRole } = usePermissions();

    if (permission && hasPermission(permission)) {
        return <>{children}</>;
    }

    if (role && hasRole(role)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
