import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';

/**
 * Middleware to enforce organization status checks
 * Blocks requests if organization is PAUSED or ARCHIVED
 */
export const enforceOrgStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        
        if (!user?.orgId) {
            // User not associated with an org, skip check
            return next();
        }

        const organization = await prisma.organization.findUnique({
            where: { id: user.orgId },
            select: { id: true, isActive: true },
        }) as any;

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        const status = (organization as any).status || 'ACTIVE';

        // Task_Org_08: Block operations for paused/archived organizations
        if (status === 'PAUSED') {
            return res.status(403).json({
                message: 'Organization is paused. Please contact your administrator.',
                code: 'ORG_PAUSED',
            });
        }

        if (status === 'ARCHIVED') {
            return res.status(403).json({
                message: 'Organization has been archived. Contact support for assistance.',
                code: 'ORG_ARCHIVED',
            });
        }

        if (!organization.isActive) {
            return res.status(403).json({
                message: 'Organization is inactive.',
                code: 'ORG_INACTIVE',
            });
        }

        // Attach organization to request for downstream use
        (req as any).organization = organization;
        next();
    } catch (error) {
        next(error);
    }
};
