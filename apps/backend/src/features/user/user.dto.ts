import { z } from 'zod';

export const UpdateRoleSchema = z.object({
    platformRole: z.enum(['SUPER_ADMIN', 'MANAGER']).optional().nullable(),
    organizationRole: z.enum(['ADMIN', 'ORG_MANAGER', 'SALES_PERSON']).optional().nullable(),
});

export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;
