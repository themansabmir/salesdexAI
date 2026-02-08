import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useGlobalMetrics } from '@/features/system/application/use-system';
import { Building2, Users, Phone, DollarSign, Clock } from 'lucide-react';

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export function GlobalMetrics() {
    const { data: metrics, isLoading } = useGlobalMetrics();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Organizations"
                value={metrics?.totalOrganizations || 0}
                description="Active organizations"
                icon={Building2}
            />
            <MetricCard
                title="Total Users"
                value={metrics?.totalUsers || 0}
                description="Across all organizations"
                icon={Users}
            />
            <MetricCard
                title="Active Meetings"
                value={metrics?.activeMeetings || 0}
                description="Currently in progress"
                icon={Phone}
            />
            <MetricCard
                title="Total Usage"
                value={`${metrics?.totalUsageHours?.toFixed(1) || 0}h`}
                description="Analyzed meeting hours"
                icon={Clock}
            />
            <MetricCard
                title="Total Revenue"
                value={`$${metrics?.totalRevenue?.toFixed(2) || 0}`}
                description="Lifetime revenue"
                icon={DollarSign}
            />
        </div>
    );
}
