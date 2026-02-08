import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
    FileText, 
    Search, 
    Filter, 
    Download, 
    Trash2, 
    Eye,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { 
    KnowledgeDocument, 
    DocumentType, 
    DocumentQuery,
    formatFileSize,
    getDocumentTypeLabel,
    getDocumentTypeColor
} from '../../domain/knowledge.types';
import { 
    useDocuments, 
    useDeleteDocument, 
    useDocumentDownloadUrl 
} from '../../application/use-knowledge';
import { DocumentDetailsModal } from './document-details-modal';

interface DocumentListProps {
    organizationId: string;
    onDocumentSelect?: (document: KnowledgeDocument) => void;
}

export function DocumentList({ organizationId, onDocumentSelect }: DocumentListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');
    const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const deleteDocument = useDeleteDocument();
    const getDownloadUrl = useDocumentDownloadUrl();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Build query parameters
    const query: DocumentQuery = {
        page: currentPage,
        limit: pageSize,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedType !== 'all' && { documentType: selectedType }),
    };

    const { data: documentsData, isLoading, error } = useDocuments(organizationId, query);

    const handleDelete = async (document: KnowledgeDocument) => {
        if (window.confirm(`Are you sure you want to delete "${document.title}"? This action cannot be undone.`)) {
            try {
                await deleteDocument.mutateAsync({
                    organizationId,
                    documentId: document.id,
                });
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    };

    const handleDownload = async (document: KnowledgeDocument) => {
        try {
            const { downloadUrl } = await getDownloadUrl.mutateAsync({
                organizationId,
                documentId: document.id,
            });
            
            // Create a temporary link and trigger download
            const link = window.document.createElement('a');
            link.href = downloadUrl;
            link.download = document.fileName;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download document:', error);
        }
    };

    const handleViewDetails = (document: KnowledgeDocument) => {
        setSelectedDocument(document);
        setDetailsModalOpen(true);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleTypeFilter = (type: DocumentType | 'all') => {
        setSelectedType(type);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load documents. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    const documents = documentsData?.documents || [];
    const pagination = documentsData?.pagination;

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                    Manage your organization's knowledge base documents
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    
                    <Select value={selectedType} onValueChange={(value: DocumentType | 'all') => handleTypeFilter(value)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="WORD">Word</SelectItem>
                            <SelectItem value="EXCEL">Excel</SelectItem>
                            <SelectItem value="POWERPOINT">PowerPoint</SelectItem>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading documents...</span>
                    </div>
                )}

                {/* Documents Table */}
                {!isLoading && documents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents found.</p>
                        <p className="text-sm">
                            {searchQuery || selectedType !== 'all' 
                                ? 'Try adjusting your search or filters.' 
                                : 'Upload your first document to get started.'
                            }
                        </p>
                    </div>
                )}

                {!isLoading && documents.length > 0 && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((document) => (
                                    <TableRow key={document.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{document.title}</div>
                                                {document.description && (
                                                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                        {document.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getDocumentTypeColor(document.documentType) as any}>
                                                {getDocumentTypeLabel(document.documentType)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                                        <TableCell>
                                            <Badge variant={document.embeddingGenerated ? 'default' : 'secondary'}>
                                                {document.embeddingGenerated ? 'Processed' : 'Processing'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(document.uploadedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(document)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownload(document)} disabled={getDownloadUrl.isPending}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(document)}
                                                        className="text-destructive"
                                                        disabled={deleteDocument.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} documents
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Document Details Modal */}
        <DocumentDetailsModal
            document={selectedDocument}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
        />
        </>
    );
}
