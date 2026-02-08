import { useState, memo, useCallback } from 'react';
import {
    useOrganizationMembers,
    useUpdateMemberRole,
    useRemoveMember,
} from '@/features/organization/application/use-organization';
import { Button } from '@/shared/ui/button';
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
import { Skeleton } from '@/shared/ui/skeleton';
import { toast } from 'sonner';
import { Users, Trash2, Shield, User, UserCog } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

// Skeleton for member list loading state
function MembersSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-9 w-9" />
                    </div>
                </div>
            ))}
        </div>
    );
}

type Member = {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: 'ADMIN' | 'ORG_MANAGER' | 'SALES_PERSON';
};

// Memoized member item component - prevents re-render when parent updates
const MemberItem = memo(function MemberItem({
    member,
    onRoleChange,
    onRemove,
    isUpdating,
}: {
    member: Member;
    onRoleChange: (userId: string, role: string) => void;
    onRemove: (userId: string) => void;
    isUpdating: boolean;
}) {
    const handleRoleChange = useCallback(
        (value: string) => {
            onRoleChange(member.id, value);
        },
        [member.id, onRoleChange]
    );

    const handleRemove = useCallback(() => {
        onRemove(member.id);
    }, [member.id, onRemove]);

    const initials = member.firstName?.[0] || member.email[0].toUpperCase();

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm">
                    {initials}
                </div>
                <div>
                    <p className="font-medium">
                        {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Select
                    defaultValue={member.role}
                    onValueChange={handleRoleChange}
                    disabled={isUpdating}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">
                            <span className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Admin
                            </span>
                        </SelectItem>
                        <SelectItem value="ORG_MANAGER">
                            <span className="flex items-center gap-2">
                                <UserCog className="h-4 w-4" />
                                Manager
                            </span>
                        </SelectItem>
                        <SelectItem value="SALES_PERSON">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Sales Person
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    disabled={isUpdating}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

export function MembersManagement() {
    const { data: members, isLoading } = useOrganizationMembers();
    const { mutate: updateMemberRole, isPending: isUpdating } = useUpdateMemberRole();
    const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    const isPending = isUpdating || isRemoving;

    const handleRoleChange = useCallback(
        (userId: string, newRole: string) => {
            updateMemberRole(
                { userId, role: newRole as any },
                {
                    onSuccess: () => toast.success('Member role updated'),
                    onError: (error: any) =>
                        toast.error(error.message || 'Failed to update role'),
                }
            );
        },
        [updateMemberRole]
    );

    const handleRemoveClick = useCallback((userId: string) => {
        setMemberToRemove(userId);
    }, []);

    const handleRemove = useCallback(() => {
        if (!memberToRemove) return;
        removeMember(memberToRemove, {
            onSuccess: () => {
                toast.success('Member removed');
                setMemberToRemove(null);
            },
            onError: (error: any) =>
                toast.error(error.message || 'Failed to remove member'),
        });
    }, [memberToRemove, removeMember]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Organization Members
                    </CardTitle>
                    <CardDescription>Manage your team members and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                    <MembersSkeleton />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Organization Members
                </CardTitle>
                <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members?.map((member) => (
                        <MemberItem
                            key={member.id}
                            member={member}
                            onRoleChange={handleRoleChange}
                            onRemove={handleRemoveClick}
                            isUpdating={isPending}
                        />
                    ))}

                    {members?.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No members found
                        </p>
                    )}
                </div>
            </CardContent>

            <AlertDialog
                open={!!memberToRemove}
                onOpenChange={() => setMemberToRemove(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this member from the
                            organization? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
