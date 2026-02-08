import { Request, Response, NextFunction } from 'express';
import { SystemService } from './system.service';
import {
    UpdateSystemConfigSchema,
    UpdateOrgFeatureSchema,
    WalletAdjustmentSchema,
} from './system.dto';
import { AuthenticatedRequest } from '@/types/auth';

export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    // Task_Sys_02: Get system configuration
    getConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const configs = await this.systemService.getSystemConfig();
            res.json(configs);
        } catch (error) {
            next(error);
        }
    };

    // Task_Sys_03: Update system configuration
    updateConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const data = UpdateSystemConfigSchema.parse(req.body);
            const config = await this.systemService.updateSystemConfig(data, userId);
            res.json(config);
        } catch (error) {
            next(error);
        }
    };

    // Get organization features
    getOrgFeatures = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = req.params.orgId as string;
            const features = await this.systemService.getOrgFeatures(orgId);
            res.json(features);
        } catch (error) {
            next(error);
        }
    };

    // Task_Sys_07: Update organization feature
    updateOrgFeature = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as AuthenticatedRequest).user.sub;
            const data = UpdateOrgFeatureSchema.parse(req.body);
            const feature = await this.systemService.updateOrgFeature(data, userId);
            res.json(feature);
        } catch (error) {
            next(error);
        }
    };

    // Task_Sys_12: Get global metrics
    getGlobalMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const metrics = await this.systemService.getGlobalMetrics();
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    };

    // Get organization metrics
    getOrgMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = req.params.orgId as string;
            const metrics = await this.systemService.getOrganizationMetrics(orgId);
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    };

    // Task_Sys_11: Get audit logs
    getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const logs = await this.systemService.getAuditLogs(limit);
            res.json(logs);
        } catch (error) {
            next(error);
        }
    };
}
