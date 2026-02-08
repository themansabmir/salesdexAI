import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useCreateOrganization } from '@/features/organization/application/use-organization';
import { toast } from 'sonner';

const createOrgSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(50).optional(),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

interface OrganizationCreateFormProps {
    onSuccess?: () => void;
}

export function OrganizationCreateForm({ onSuccess }: OrganizationCreateFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const createOrganization = useCreateOrganization();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateOrgForm>({
        resolver: zodResolver(createOrgSchema),
    });

    const onSubmit = async (data: CreateOrgForm) => {
        setIsLoading(true);
        try {
            await createOrganization.mutateAsync(data);
            toast.success('Organization created successfully');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>
                    Set up your organization to start using SalesDex
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                            id="name"
                            placeholder="Acme Inc"
                            {...register('name')}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">
                            Slug <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            id="slug"
                            placeholder="acme-inc"
                            {...register('slug')}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Used for URLs. Auto-generated if not provided.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Organization'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
