import { GlobalMetrics } from '@/features/system/presentation/components/global-metrics';
import { SystemConfigManager } from '@/features/system/presentation/components/system-config-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Shield, Settings, BarChart3 } from 'lucide-react';

export function SuperadminDashboardPage() {
    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Superadmin Dashboard</h1>
                <p className="text-muted-foreground">Platform-wide configuration and management</p>
            </div>

            <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metrics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Metrics
                    </TabsTrigger>
                    <TabsTrigger value="config" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System Config
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Audit Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="mt-6 space-y-6">
                    <GlobalMetrics />
                </TabsContent>

                <TabsContent value="config" className="mt-6">
                    <SystemConfigManager />
                </TabsContent>

                <TabsContent value="audit" className="mt-6">
                    <div className="p-8 text-center text-muted-foreground">
                        Audit logs viewer coming soon
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
