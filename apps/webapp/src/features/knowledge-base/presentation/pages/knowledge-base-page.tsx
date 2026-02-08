import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
    BookOpen, 
    Upload, 
    Users, 
    Search, 
    FileText, 
    TrendingUp,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { DocumentUpload } from '../components/document-upload';
import { DocumentList } from '../components/document-list';
import { CompetitorManager } from '../components/competitor-manager';
import { useDocuments, useCompetitors } from '../../application/use-knowledge';
import { KnowledgeDocument } from '../../domain/knowledge.types';
import { useUser } from '@/features/auth/application/use-user';

export function KnowledgeBasePage() {
    const { data: user } = useUser();
    const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const organizationId = user?.organizationId || '';
    
    const {
        data: documentsData,
        isLoading: documentsLoading,
        error: documentsError
    } = useDocuments(organizationId, { page: 1, limit: 5 });
    
    const {
        data: competitorsData,
        isLoading: competitorsLoading,
        error: competitorsError
    } = useCompetitors(organizationId, { page: 1, limit: 6 });

    const documents = documentsData?.documents || [];
    const competitors = competitorsData?.competitors || [];
    const totalDocuments = documentsData?.pagination?.total || 0;
    const totalCompetitors = competitorsData?.pagination?.total || 0;

    const handleDocumentUploaded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleDocumentSelect = (document: KnowledgeDocument) => {
        setSelectedDocument(document);
    };

    const getProcessingStatus = () => {
        const processedCount = documents.filter(d => d.embeddingGenerated).length;
        const totalCount = documents.length;
        
        if (totalCount === 0) return { status: 'empty', message: 'No documents uploaded yet' };
        if (processedCount === totalCount) return { status: 'complete', message: 'All documents processed' };
        
        const percentage = Math.round((processedCount / totalCount) * 100);
        return { 
            status: 'processing', 
            message: `${processedCount}/${totalCount} documents processed (${percentage}%)` 
        };
    };

    const processingStatus = getProcessingStatus();

    if (!organizationId) {
        return (
            <div className="container mx-auto py-8">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You need to be part of an organization to access the knowledge base.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BookOpen className="h-8 w-8" />
                    Knowledge Base
                </h1>
                <p className="text-muted-foreground">
                    Manage your documents and competitor information to power AI analysis.
                </p>
            </div>

            {/* Status Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDocuments}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Competitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCompetitors}</div>
                        <p className="text-xs text-muted-foreground">
                            Tracked competitors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
                        {processingStatus.status === 'complete' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : processingStatus.status === 'processing' ? (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 text-gray-400" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {processingStatus.status === 'empty' ? '0' : 
                             processingStatus.status === 'complete' ? '100%' :
                             Math.round((documents.filter(d => d.embeddingGenerated).length / documents.length) * 100) + '%'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {processingStatus.message}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Search Ready</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {documents.filter(d => d.embeddingGenerated).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Documents available for AI search
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Processing Alert */}
            {processingStatus.status === 'processing' && (
                <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                        Documents are being processed. AI search will be available once processing completes.
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Tabs defaultValue="documents" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="competitors">Competitors</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="space-y-6">
                    <DocumentList
                        organizationId={organizationId}
                        onDocumentSelect={handleDocumentSelect}
                    />
                </TabsContent>

                <TabsContent value="competitors" className="space-y-6">
                    <CompetitorManager organizationId={organizationId} />
                </TabsContent>

                <TabsContent value="upload" className="space-y-6">
                    <DocumentUpload
                        organizationId={organizationId}
                        onSuccess={handleDocumentUploaded}
                    />
                </TabsContent>
            </Tabs>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documents.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No documents uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.slice(0, 3).map((document) => (
                                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{document.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(document.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={document.embeddingGenerated ? 'default' : 'secondary'}>
                                            {document.embeddingGenerated ? 'Ready' : 'Processing'}
                                        </Badge>
                                    </div>
                                ))}
                                {totalDocuments > 3 && (
                                    <Button variant="outline" size="sm" className="w-full">
                                        View All Documents ({totalDocuments - 3} more)
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Competitors */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Competitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {competitors.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No competitors added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {competitors.slice(0, 3).map((competitor) => (
                                    <div key={competitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{competitor.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {competitor.strengths.length} strengths, {competitor.weaknesses.length} weaknesses
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {competitor.differentiators.length} differentiators
                                        </Badge>
                                    </div>
                                ))}
                                {totalCompetitors > 3 && (
                                    <Button variant="outline" size="sm" className="w-full">
                                        View All Competitors ({totalCompetitors - 3} more)
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
