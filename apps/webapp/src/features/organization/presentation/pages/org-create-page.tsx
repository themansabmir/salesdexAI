import { useNavigate } from 'react-router-dom';
import { OrganizationCreateForm } from '@/features/organization/presentation/components/org-create-form';
import { useAuth } from '@/features/auth/application/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Building2 } from 'lucide-react';

export function OrganizationCreatePage() {
    const navigate = useNavigate();
    const { refresh } = useAuth();

    const handleSuccess = async () => {
        await refresh();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md">
                <Card className="border-primary/10 shadow-xl">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Create Your Organization</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Set up your organization to start using SalesDex for your sales team
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <OrganizationCreateForm onSuccess={handleSuccess} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
