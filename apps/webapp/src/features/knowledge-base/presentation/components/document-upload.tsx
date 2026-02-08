import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentType, getDocumentTypeLabel, KnowledgeDocument } from '../../domain/knowledge.types';
import { useCompleteDocumentUpload } from '../../application/use-knowledge';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const uploadSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    documentType: z.nativeEnum(DocumentType),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface DocumentUploadProps {
    organizationId: string;
    onSuccess?: (document: KnowledgeDocument) => void;
}

export function DocumentUpload({ organizationId, onSuccess }: DocumentUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const uploadDocument = useCompleteDocumentUpload();

    const form = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            description: '',
            documentType: DocumentType.OTHER,
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                alert('File size must be less than 10MB');
                return;
            }
            
            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                alert('File type not supported. Please upload PDF, Word, or text files.');
                return;
            }
            
            setSelectedFile(file);
            // Auto-populate title with filename (without extension)
            const titleWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
            form.setValue('title', titleWithoutExtension);
            setUploadStatus('idle');
        }
    };

    const onSubmit = async (data: UploadFormData) => {
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus('idle');

        try {
            const document = await uploadDocument.uploadCompleteDocument(
                organizationId,
                selectedFile,
                data,
                (progress: number) => setUploadProgress(progress)
            );
            
            setUploadStatus('success');
            onSuccess?.(document);
            
            // Reset form
            form.reset();
            setSelectedFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            setUploadStatus('error');
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Document
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* File Selection */}
                <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            ref={fileInputRef}
                            id="file"
                            type="file"
                            accept={ACCEPTED_FILE_TYPES.join(',')}
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        {selectedFile && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{selectedFile.name}</span>
                                <span>({formatFileSize(selectedFile.size)})</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, Word, Plain Text, Markdown (Max: 10MB)
                    </p>
                </div>

                {/* Upload Form */}
                {selectedFile && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter document title"
                                                {...field}
                                                disabled={isUploading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter document description"
                                                rows={3}
                                                {...field}
                                                disabled={isUploading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="documentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Document Type</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value: DocumentType) => field.onChange(value)}
                                            disabled={isUploading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select document type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(DocumentType).map((type) => (
                                                    <SelectItem key={String(type)} value={type}>
                                                        {getDocumentTypeLabel(type)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Uploading and processing...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="w-full" />
                                </div>
                            )}

                            {/* Status Messages */}
                            {uploadStatus === 'success' && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Document uploaded successfully and is being processed.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {uploadStatus === 'error' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Upload failed. Please try again.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isUploading}
                                className="w-full"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
