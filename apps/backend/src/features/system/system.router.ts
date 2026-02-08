import { Router } from 'express';
import { SystemController } from '@/features/system/system.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { ITokenService } from '@/core/ports/token.port';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export const createSystemRouter = (
    systemController: SystemController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);

    // All routes require authentication and super_admin role
    router.use(authMiddleware);
    router.use(requireRole('SUPER_ADMIN'));

    // Task_Sys_02, Task_Sys_03: System configuration
    router.get('/config', systemController.getConfig);
    router.patch('/config', systemController.updateConfig);

    // Task_Sys_07: Organization features
    router.get('/organizations/:orgId/features', systemController.getOrgFeatures);
    router.patch('/organizations/features', systemController.updateOrgFeature);

    // Task_Sys_12: Global metrics
    router.get('/metrics', systemController.getGlobalMetrics);
    router.get('/organizations/:orgId/metrics', systemController.getOrgMetrics);

    // Task_Sys_11: Audit logs
    router.get('/audit-logs', systemController.getAuditLogs);

    return router;
};
