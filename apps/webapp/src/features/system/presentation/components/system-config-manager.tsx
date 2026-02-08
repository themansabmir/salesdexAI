import { useState } from 'react';
import { useSystemConfig, useUpdateSystemConfig } from '@/features/system/application/use-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function SystemConfigManager() {
    const { data: configs, isLoading } = useSystemConfig();
    const updateConfig = useUpdateSystemConfig();
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    const handleEdit = (key: string, currentValue: string | number | boolean) => {
        setEditingKey(key);
        setEditValue(String(currentValue));
    };

    const handleSave = async (key: string) => {
        try {
            let parsedValue: string | number | boolean = editValue;
            
            // Try to parse as number or boolean
            if (editValue === 'true') parsedValue = true;
            else if (editValue === 'false') parsedValue = false;
            else if (!isNaN(Number(editValue))) parsedValue = Number(editValue);
            
            await updateConfig.mutateAsync({
                key,
                value: parsedValue,
            });
            toast.success('Configuration updated');
            setEditingKey(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update configuration');
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {configs?.map((config) => (
                        <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium">{config.key}</p>
                                {config.description && (
                                    <p className="text-sm text-muted-foreground">{config.description}</p>
                                )}
                            </div>
                            
                            {editingKey === config.key ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-48"
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleSave(config.key)}
                                        disabled={updateConfig.isPending}
                                    >
                                        {updateConfig.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Save'
                                        )}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={handleCancel}
                                        disabled={updateConfig.isPending}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">
                                        {String(config.value)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(config.key, config.value)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {configs?.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No configuration settings found
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
