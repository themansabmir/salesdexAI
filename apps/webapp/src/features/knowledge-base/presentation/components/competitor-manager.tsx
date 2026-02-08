import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Plus, Edit, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Competitor } from '../../domain/knowledge.types';
import { 
    useCreateCompetitor, 
    useUpdateCompetitor, 
    useDeleteCompetitor 
} from '../../application/use-knowledge';

const competitorSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    strengths: z.array(z.string().max(500)).max(10, 'Too many strengths'),
    weaknesses: z.array(z.string().max(500)).max(10, 'Too many weaknesses'),
    differentiators: z.array(z.string().max(500)).max(10, 'Too many differentiators'),
    pricingInfo: z.string().max(500, 'Pricing info too long').optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CompetitorFormData = z.infer<typeof competitorSchema>;

interface CompetitorFormProps {
    organizationId: string;
    competitor?: Competitor;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function CompetitorForm({ organizationId, competitor, onSuccess, onCancel }: CompetitorFormProps) {
    const isEditing = !!competitor;
    const createCompetitor = useCreateCompetitor();
    const updateCompetitor = useUpdateCompetitor();

    const form = useForm<CompetitorFormData>({
        resolver: zodResolver(competitorSchema),
        defaultValues: {
            name: competitor?.name || '',
            description: competitor?.description || '',
            strengths: competitor?.strengths || [''],
            weaknesses: competitor?.weaknesses || [''],
            differentiators: competitor?.differentiators || [''],
            pricingInfo: competitor?.pricingInfo || '',
            website: competitor?.website || '',
        },
    });

    const onSubmit = async (data: CompetitorFormData) => {
        try {
            // Filter out empty strings from arrays
            const cleanData = {
                ...data,
                strengths: data.strengths.filter(s => s.trim() !== ''),
                weaknesses: data.weaknesses.filter(w => w.trim() !== ''),
                differentiators: data.differentiators.filter(d => d.trim() !== ''),
            };

            if (isEditing && competitor) {
                await updateCompetitor.mutateAsync({
                    organizationId,
                    competitorId: competitor.id,
                    data: cleanData,
                });
            } else {
                await createCompetitor.mutateAsync({
                    organizationId,
                    data: cleanData,
                });
            }
            
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save competitor:', error);
        }
    };

    const addArrayItem = (field: 'strengths' | 'weaknesses' | 'differentiators') => {
        const currentValues = form.getValues(field);
        if (currentValues.length < 10) {
            form.setValue(field, [...currentValues, '']);
        }
    };

    const removeArrayItem = (field: 'strengths' | 'weaknesses' | 'differentiators', index: number) => {
        const currentValues = form.getValues(field);
        form.setValue(field, currentValues.filter((_, i) => i !== index));
    };

    const updateArrayItem = (field: 'strengths' | 'weaknesses' | 'differentiators', index: number, value: string) => {
        const currentValues = form.getValues(field);
        currentValues[index] = value;
        form.setValue(field, currentValues);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? 'Edit Competitor' : 'Add New Competitor'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Competitor name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the competitor"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pricingInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pricing Information</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Pricing model, typical price range, etc."
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Strengths */}
                        <div className="space-y-2">
                            <Label>Strengths</Label>
                            {form.watch('strengths').map((strength, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder={`Strength ${index + 1}`}
                                        value={strength}
                                        onChange={(e) => updateArrayItem('strengths', index, e.target.value)}
                                    />
                                    {form.watch('strengths').length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeArrayItem('strengths', index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {form.watch('strengths').length < 10 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem('strengths')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Strength
                                </Button>
                            )}
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2">
                            <Label>Weaknesses</Label>
                            {form.watch('weaknesses').map((weakness, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder={`Weakness ${index + 1}`}
                                        value={weakness}
                                        onChange={(e) => updateArrayItem('weaknesses', index, e.target.value)}
                                    />
                                    {form.watch('weaknesses').length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeArrayItem('weaknesses', index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {form.watch('weaknesses').length < 10 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem('weaknesses')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Weakness
                                </Button>
                            )}
                        </div>

                        {/* Differentiators */}
                        <div className="space-y-2">
                            <Label>Differentiators</Label>
                            {form.watch('differentiators').map((differentiator, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder={`Differentiator ${index + 1}`}
                                        value={differentiator}
                                        onChange={(e) => updateArrayItem('differentiators', index, e.target.value)}
                                    />
                                    {form.watch('differentiators').length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeArrayItem('differentiators', index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {form.watch('differentiators').length < 10 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem('differentiators')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Differentiator
                                </Button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={createCompetitor.isPending || updateCompetitor.isPending}
                            >
                                {createCompetitor.isPending || updateCompetitor.isPending
                                    ? 'Saving...'
                                    : isEditing
                                    ? 'Update Competitor'
                                    : 'Create Competitor'
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

interface CompetitorListProps {
    organizationId: string;
    competitors: Competitor[];
    onEdit?: (competitor: Competitor) => void;
    onRefresh?: () => void;
}

export function CompetitorList({ organizationId, competitors, onEdit, onRefresh }: CompetitorListProps) {
    const deleteCompetitor = useDeleteCompetitor();

    const handleDelete = async (competitor: Competitor) => {
        if (window.confirm(`Are you sure you want to delete "${competitor.name}"? This action cannot be undone.`)) {
            try {
                await deleteCompetitor.mutateAsync({
                    organizationId,
                    competitorId: competitor.id,
                });
                onRefresh?.();
            } catch (error) {
                console.error('Failed to delete competitor:', error);
            }
        }
    };

    if (competitors.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No competitors added yet.</p>
                <p className="text-sm">Add your first competitor to start tracking the competition.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
                <Card key={competitor.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{competitor.name}</CardTitle>
                            <div className="flex gap-1">
                                {competitor.website && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={competitor.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit?.(competitor)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(competitor)}
                                    disabled={deleteCompetitor.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {competitor.description && (
                            <p className="text-sm text-muted-foreground">
                                {competitor.description}
                            </p>
                        )}

                        {competitor.pricingInfo && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Pricing</h4>
                                <p className="text-sm text-muted-foreground">
                                    {competitor.pricingInfo}
                                </p>
                            </div>
                        )}

                        {competitor.strengths.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Strengths</h4>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {competitor.strengths.slice(0, 3).map((strength, index) => (
                                        <li key={index}>{strength}</li>
                                    ))}
                                    {competitor.strengths.length > 3 && (
                                        <li className="italic">+{competitor.strengths.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {competitor.weaknesses.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Weaknesses</h4>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {competitor.weaknesses.slice(0, 3).map((weakness, index) => (
                                        <li key={index}>{weakness}</li>
                                    ))}
                                    {competitor.weaknesses.length > 3 && (
                                        <li className="italic">+{competitor.weaknesses.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

interface CompetitorManagerProps {
    organizationId: string;
}

export function CompetitorManager({ organizationId }: CompetitorManagerProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCompetitor, setEditingCompetitor] = useState<Competitor | undefined>();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (competitor: Competitor) => {
        setEditingCompetitor(competitor);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingCompetitor(undefined);
        setRefreshKey(prev => prev + 1); // Trigger refresh
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingCompetitor(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Competitor Analysis</h2>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Competitor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCompetitor ? 'Edit Competitor' : 'Add New Competitor'}
                            </DialogTitle>
                        </DialogHeader>
                        <CompetitorForm
                            organizationId={organizationId}
                            competitor={editingCompetitor}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <CompetitorList
                organizationId={organizationId}
                competitors={[]} // This will be populated by the parent component
                onEdit={handleEdit}
                onRefresh={() => setRefreshKey(prev => prev + 1)}
            />
        </div>
    );
}
