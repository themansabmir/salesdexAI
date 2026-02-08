import { Router } from 'express';
import { OrganizationController } from './org.controller';
import { createAuthMiddleware } from '@/core/middleware/auth.middleware';
import { ITokenService } from '@/core/ports/token.port';
import { requireRole } from '@/core/middleware/role-guard.middleware';

export const createOrganizationRouter = (
    orgController: OrganizationController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    const authMiddleware = createAuthMiddleware(tokenService);

    // All routes here require authentication
    router.use(authMiddleware);

    // Organization CRUD
    router.post('/', orgController.create);
    router.get('/me', orgController.getMe);
    router.patch('/me', orgController.update);

    // Task_Org_07: Organization status management (super_admin only)
    router.patch('/me/status', requireRole('SUPER_ADMIN'), orgController.updateStatus);

    // Task_Org_09, 10, 11: Invitation management
    router.post('/invitations', orgController.inviteUser);
    router.get('/invitations', orgController.listInvitations);
    router.patch('/invitations/:invitationId/revoke', orgController.revokeInvitation);

    // Task_Org_12: Accept invitation
    router.post('/accept-invite', orgController.acceptInvitation);

    // Task_Org_14, 15, 16: Member management
    router.get('/members', orgController.listMembers);
    router.patch('/members/role', orgController.updateMemberRole);
    router.delete('/members/:memberId', orgController.removeMember);

    // Task_Sys_09, 10: Wallet manual credit/debit (super_admin only)
    router.post('/:orgId/wallet/credit', requireRole('SUPER_ADMIN'), orgController.creditWallet);
    router.post('/:orgId/wallet/debit', requireRole('SUPER_ADMIN'), orgController.debitWallet);

    return router;
};
