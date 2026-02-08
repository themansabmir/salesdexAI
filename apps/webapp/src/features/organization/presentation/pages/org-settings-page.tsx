import { lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { Building2, Users, Mail } from 'lucide-react';

// Lazy load tab content to eliminate waterfall loading
const OrganizationManagement = lazy(() => import('@/features/organization/presentation/components/org-management').then(m => ({ default: m.OrganizationManagement })));
const MembersManagement = lazy(() => import('@/features/organization/presentation/components/members-management').then(m => ({ default: m.MembersManagement })));
const InvitationsManagement = lazy(() => import('@/features/organization/presentation/components/invitations-management').then(m => ({ default: m.InvitationsManagement })));

function TabSkeleton() {
    return (
        <div className="space-y-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export function OrganizationSettingsPage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Organization Settings</h1>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members
                    </TabsTrigger>
                    <TabsTrigger value="invitations" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Invitations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Suspense fallback={<TabSkeleton />}>
                        <OrganizationManagement />
                    </Suspense>
                </TabsContent>

                <TabsContent value="members" className="mt-6">
                    <Suspense fallback={<TabSkeleton />}>
                        <MembersManagement />
                    </Suspense>
                </TabsContent>

                <TabsContent value="invitations" className="mt-6">
                    <Suspense fallback={<TabSkeleton />}>
                        <InvitationsManagement />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}
