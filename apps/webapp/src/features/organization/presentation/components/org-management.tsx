import { useState, memo, useCallback } from 'react';
import { useOrganization, useUpdateOrganization } from '@/features/organization/application/use-organization';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { toast } from 'sonner';
import { Building2, Wallet } from 'lucide-react';

// Skeleton loader for better UX
function OrganizationSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-9 w-16" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
}

// Status badge component - extracted for reusability
const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
        ACTIVE: 'default',
        PAUSED: 'secondary',
        ARCHIVED: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
});

// Editable name form - memoized to prevent re-renders
const EditNameForm = memo(function EditNameForm({
    initialName,
    onSave,
    onCancel,
    isPending,
}: {
    initialName: string;
    onSave: (name: string) => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const [name, setName] = useState(initialName);

    return (
        <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
            />
            <div className="flex gap-2">
                <Button onClick={() => onSave(name)} size="sm" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
                    Cancel
                </Button>
            </div>
        </div>
    );
});

// Read-only name display - memoized
const NameDisplay = memo(function NameDisplay({
    name,
    onEdit,
}: {
    name: string;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
            </Button>
        </div>
    );
});

// Wallet card - memoized
const WalletCard = memo(function WalletCard({
    balance,
    currency,
}: {
    balance: number;
    currency: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Balance
                </CardTitle>
                <CardDescription>Your organization's prepaid balance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">${balance.toFixed(2)}</span>
                    <span className="text-muted-foreground">{currency}</span>
                </div>
            </CardContent>
        </Card>
    );
});

export function OrganizationManagement() {
    const { data: organization, isLoading } = useOrganization();
    const { mutate: updateOrganization, isPending } = useUpdateOrganization();
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = useCallback(
        (name: string) => {
            updateOrganization(
                { name },
                {
                    onSuccess: () => {
                        toast.success('Organization updated');
                        setIsEditing(false);
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Failed to update organization');
                    },
                }
            );
        },
        [updateOrganization]
    );

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => setIsEditing(false), []);

    if (isLoading) {
        return <OrganizationSkeleton />;
    }

    if (!organization) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">No organization found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Organization Details
                    </CardTitle>
                    <CardDescription>Manage your organization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <StatusBadge status={organization.status} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Slug</p>
                            <p className="font-medium">{organization.slug}</p>
                        </div>
                    </div>

                    {isEditing ? (
                        <EditNameForm
                            initialName={organization.name}
                            onSave={handleUpdate}
                            onCancel={handleCancel}
                            isPending={isPending}
                        />
                    ) : (
                        <NameDisplay name={organization.name} onEdit={handleEdit} />
                    )}
                </CardContent>
            </Card>

            <WalletCard balance={organization.walletBalance} currency={organization.currency} />
        </div>
    );
}
