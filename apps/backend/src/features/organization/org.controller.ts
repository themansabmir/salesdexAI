import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './org.service';
import {
    CreateOrganizationSchema,
    UpdateOrganizationSchema,
    UpdateOrganizationStatusSchema,
    CreateInvitationSchema,
    AcceptInvitationSchema,
    UpdateMemberRoleSchema,
} from './org.dto';

export class OrganizationController {
    constructor(private readonly orgService: OrganizationService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = CreateOrganizationSchema.parse(req.body);
            const org = await this.orgService.createOrganization(userId, data);
            res.status(201).json(org);
        } catch (error) {
            next(error);
        }
    };

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const org = await this.orgService.getMyOrganization(userId);
            res.json(org);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = UpdateOrganizationSchema.parse(req.body);
            const org = await this.orgService.updateOrganization(userId, data);
            res.json(org);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_07: Update organization status (pause/archive)
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = UpdateOrganizationStatusSchema.parse(req.body);
            const org = await this.orgService.updateOrganizationStatus(userId, data);
            res.json(org);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_09: Invite user to organization
    inviteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = CreateInvitationSchema.parse(req.body);
            const invitation = await this.orgService.inviteUser(userId, data);
            res.status(201).json(invitation);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_12: Accept invitation
    acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = AcceptInvitationSchema.parse(req.body);
            const org = await this.orgService.acceptInvitation(data.token, userId);
            res.json(org);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_14: List organization members
    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const members = await this.orgService.listOrganizationMembers(userId);
            res.json(members);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_15: Update member role
    updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const data = UpdateMemberRoleSchema.parse(req.body);
            const member = await this.orgService.updateMemberRole(userId, data);
            res.json(member);
        } catch (error) {
            next(error);
        }
    };

    // Task_Org_16: Remove member from organization
    removeMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const memberId = req.params.memberId as string;
            await this.orgService.removeMember(userId, memberId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    // List invitations
    listInvitations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const invitations = await this.orgService.listInvitations(userId);
            res.json(invitations);
        } catch (error) {
            next(error);
        }
    };

    // Revoke invitation
    revokeInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.sub;
            const invitationId = req.params.invitationId as string;
            const invitation = await this.orgService.revokeInvitation(userId, invitationId);
            res.json(invitation);
        } catch (error) {
            next(error);
        }
    };
}
