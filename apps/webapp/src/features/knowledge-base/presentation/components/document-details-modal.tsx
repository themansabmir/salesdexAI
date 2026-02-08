import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import { KnowledgeDocument } from '../../domain/knowledge.types';
import { formatFileSize, getDocumentTypeLabel, getDocumentTypeColor } from '../../domain/knowledge.types';

interface DocumentDetailsModalProps {
    document: KnowledgeDocument | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DocumentDetailsModal({ document, open, onOpenChange }: DocumentDetailsModalProps) {
    if (!document) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Document Details</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Title and Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{document.title}</h3>
                        {document.description && (
                            <p className="text-muted-foreground">{document.description}</p>
                        )}
                    </div>

                    {/* Document Information Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                            <div className="mt-1">
                                <Badge variant={getDocumentTypeColor(document.documentType) as any}>
                                    {getDocumentTypeLabel(document.documentType)}
                                </Badge>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">File Size</label>
                            <div className="mt-1 text-sm">{formatFileSize(document.fileSize)}</div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">File Name</label>
                            <div className="mt-1 text-sm font-mono">{document.fileName}</div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">MIME Type</label>
                            <div className="mt-1 text-sm">{document.mimeType}</div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="mt-1">
                                <Badge variant={document.embeddingGenerated ? 'default' : 'secondary'}>
                                    {document.embeddingGenerated ? 'Processed' : 'Processing'}
                                </Badge>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Uploaded</label>
                            <div className="mt-1 text-sm">
                                {new Date(document.uploadedAt).toLocaleDateString()} at{' '}
                                {new Date(document.uploadedAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    {/* Storage Information */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Storage Information</label>
                        <div className="mt-1 space-y-1">
                            <div className="text-sm">
                                <span className="font-medium">File URL:</span>{' '}
                                <code className="bg-muted px-2 py-1 rounded text-xs">{document.fileUrl}</code>
                            </div>
                        </div>
                    </div>

                    {/* Document ID */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Document ID</label>
                        <div className="mt-1">
                            <code className="bg-muted px-2 py-1 rounded text-xs">{document.id}</code>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
