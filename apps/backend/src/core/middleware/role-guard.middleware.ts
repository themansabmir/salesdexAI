import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/features/auth/permissions';

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role as UserRole;

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        next();
    };
};

export const requirePermission = (...requiredPermissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role as UserRole;
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];

        const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

        if (!hasAllPermissions) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
