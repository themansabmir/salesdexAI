import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/features/auth/permissions';

// JWT payload interface
interface TokenPayload {
    sub: string;
    email: string;
    platformRole?: UserRole | null;
    organizationRole?: UserRole | null;
    orgId?: string | null;
}

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as TokenPayload | undefined;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRoles = [user.platformRole, user.organizationRole].filter(Boolean) as UserRole[];
        const hasRole = roles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        next();
    };
};

export const requirePermission = (...requiredPermissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as TokenPayload | undefined;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRoles = [user.platformRole, user.organizationRole].filter(Boolean) as UserRole[];
        const userPermissions = userRoles.flatMap(role => ROLE_PERMISSIONS[role] || []);
        const uniquePermissions = new Set(userPermissions);

        const hasAllPermissions = requiredPermissions.every(p => uniquePermissions.has(p));

        if (!hasAllPermissions) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
