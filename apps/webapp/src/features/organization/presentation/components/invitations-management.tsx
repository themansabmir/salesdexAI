import { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    useInvitations,
    useInviteUser,
    useRevokeInvitation,
} from '@/features/organization/application/use-organization';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { toast } from 'sonner';
import { Mail, Shield, User, UserCog, X } from 'lucide-react';

const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'ORG_MANAGER', 'SALES_PERSON']),
});

type InviteForm = z.infer<typeof inviteSchema>;

// Skeleton loader for invitations list
function InvitationsSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-9 w-9" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Role badge component - memoized
const RoleBadge = memo(function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        ADMIN: { label: 'Admin', icon: <Shield className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
        ORG_MANAGER: { label: 'Manager', icon: <UserCog className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
        SALES_PERSON: { label: 'Sales', icon: <User className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    };
    const config = roleConfig[role];
    if (!config) return null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
});

// Status badge component - memoized
const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        PENDING: { label: 'Pending', variant: 'secondary' },
        ACCEPTED: { label: 'Accepted', variant: 'default' },
        EXPIRED: { label: 'Expired', variant: 'destructive' },
        REVOKED: { label: 'Revoked', variant: 'outline' },
    };
    const config = statusConfig[status];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
});

// Invitation item component - memoized to prevent re-renders
const InvitationItem = memo(function InvitationItem({
    invitation,
    onRevoke,
    formatDate,
}: {
    invitation: {
        id: string;
        email: string;
        role: string;
        status: string;
        expiresAt: Date;
    };
    onRevoke: (id: string) => void;
    formatDate: (date: Date) => string;
}) {
    const handleRevoke = useCallback(() => {
        onRevoke(invitation.id);
    }, [invitation.id, onRevoke]);

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                </div>
                <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Expires: {formatDate(invitation.expiresAt)}</span>
                        <span>•</span>
                        <StatusBadge status={invitation.status} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <RoleBadge role={invitation.role} />

                {invitation.status === 'PENDING' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRevoke}
                        className="text-destructive hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
});

export function InvitationsManagement() {
    const { data: invitations, isLoading } = useInvitations();
    const { mutate: inviteUser, isPending: isInviting } = useInviteUser();
    const { mutate: revokeInvitation } = useRevokeInvitation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<InviteForm>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            role: 'SALES_PERSON',
        },
    });

    const onSubmit = useCallback(
        (data: InviteForm) => {
            inviteUser(data, {
                onSuccess: () => {
                    toast.success('Invitation sent successfully');
                    reset();
                },
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to send invitation');
                },
            });
        },
        [inviteUser, reset]
    );

    const handleRevoke = useCallback(
        (invitationId: string) => {
            revokeInvitation(invitationId, {
                onSuccess: () => toast.success('Invitation revoked'),
                onError: (error: any) => toast.error(error.message || 'Failed to revoke invitation'),
            });
        },
        [revokeInvitation]
    );

    const formatDate = useCallback((date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, []);

    const handleRoleChange = useCallback(
        (value: string) => {
            setValue('role', value as any);
        },
        [setValue]
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Send Invitation
                    </CardTitle>
                    <CardDescription>Invite new members to your organization</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="colleague@company.com"
                                    {...register('email')}
                                    disabled={isInviting}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="w-48 space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    defaultValue="SALES_PERSON"
                                    onValueChange={handleRoleChange}
                                    disabled={isInviting}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="ORG_MANAGER">Manager</SelectItem>
                                        <SelectItem value="SALES_PERSON">Sales Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" disabled={isInviting}>
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>Manage sent invitations</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <InvitationsSkeleton />
                    ) : invitations?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No invitations sent yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {invitations?.map((invitation) => (
                                <InvitationItem
                                    key={invitation.id}
                                    invitation={invitation}
                                    onRevoke={handleRevoke}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
