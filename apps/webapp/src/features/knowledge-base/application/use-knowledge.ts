import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    uploadDocumentApi,
    getDocumentsApi,
    getDocumentApi,
    deleteDocumentApi,
    getDocumentDownloadUrlApi,
    createCompetitorApi,
    getCompetitorsApi,
    getCompetitorApi,
    updateCompetitorApi,
    deleteCompetitorApi,
    searchKnowledgeApi,
    uploadFileToSignedUrl,
} from '../infrastructure/knowledge.api';
import {
    KnowledgeDocument,
    DocumentUploadRequest,
    DocumentUploadResponse,
    DocumentQuery,
    DocumentListResponse,
    Competitor,
    CreateCompetitorRequest,
    UpdateCompetitorRequest,
    CompetitorQuery,
    CompetitorListResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
} from '../domain/knowledge.types';

// Query keys
export const knowledgeKeys = {
    all: ['knowledge'] as const,
    documents: (orgId: string) => [...knowledgeKeys.all, 'documents', orgId] as const,
    document: (orgId: string, documentId: string) => [...knowledgeKeys.documents(orgId), documentId] as const,
    competitors: (orgId: string) => [...knowledgeKeys.all, 'competitors', orgId] as const,
    competitor: (orgId: string, competitorId: string) => [...knowledgeKeys.competitors(orgId), competitorId] as const,
    search: (orgId: string, query: string) => [...knowledgeKeys.all, 'search', orgId, query] as const,
};

// Document hooks
export const useDocuments = (organizationId: string, query?: DocumentQuery) => {
    return useQuery({
        queryKey: [...knowledgeKeys.documents(organizationId), query],
        queryFn: () => getDocumentsApi(organizationId, query),
        enabled: !!organizationId,
    });
};

export const useDocument = (organizationId: string, documentId: string) => {
    return useQuery({
        queryKey: knowledgeKeys.document(organizationId, documentId),
        queryFn: () => getDocumentApi(organizationId, documentId),
        enabled: !!organizationId && !!documentId,
    });
};

export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ organizationId, data }: { organizationId: string; data: DocumentUploadRequest }) =>
            uploadDocumentApi(organizationId, data),
        onSuccess: (response: DocumentUploadResponse, { organizationId }) => {
            // Invalidate documents list to show the new document
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents(organizationId) });
            
            // Add the new document to the cache immediately for better UX
            queryClient.setQueryData(
                knowledgeKeys.document(organizationId, response.document.id),
                response.document
            );
        },
    });
};

export const useUploadFileToSignedUrl = () => {
    return useMutation({
        mutationFn: ({ signedUrl, file, onProgress }: { 
            signedUrl: string; 
            file: File; 
            onProgress?: (progress: number) => void 
        }) => uploadFileToSignedUrl(signedUrl, file, onProgress),
    });
};

export const useDocumentDownloadUrl = () => {
    return useMutation({
        mutationFn: ({ organizationId, documentId }: { organizationId: string; documentId: string }) =>
            getDocumentDownloadUrlApi(organizationId, documentId),
    });
};

// useProcessDocument removed - document processing is now automatic via webhook
// The storage service will automatically call the webhook when upload is complete
// Document status will be updated via polling or WebSocket in real-time

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ organizationId, documentId }: { organizationId: string; documentId: string }) =>
            deleteDocumentApi(organizationId, documentId),
        onSuccess: (_, { organizationId }) => {
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents(organizationId) });
        },
    });
};

// Competitor hooks
export const useCompetitors = (organizationId: string, query?: CompetitorQuery) => {
    return useQuery({
        queryKey: [...knowledgeKeys.competitors(organizationId), query],
        queryFn: () => getCompetitorsApi(organizationId, query),
        enabled: !!organizationId,
    });
};

export const useCompetitor = (organizationId: string, competitorId: string) => {
    return useQuery({
        queryKey: knowledgeKeys.competitor(organizationId, competitorId),
        queryFn: () => getCompetitorApi(organizationId, competitorId),
        enabled: !!organizationId && !!competitorId,
    });
};

export const useCreateCompetitor = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ organizationId, data }: { organizationId: string; data: CreateCompetitorRequest }) =>
            createCompetitorApi(organizationId, data),
        onSuccess: (_, { organizationId }) => {
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.competitors(organizationId) });
        },
    });
};

export const useUpdateCompetitor = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ 
            organizationId, 
            competitorId, 
            data 
        }: { 
            organizationId: string; 
            competitorId: string; 
            data: UpdateCompetitorRequest 
        }) => updateCompetitorApi(organizationId, competitorId, data),
        onSuccess: (_, { organizationId, competitorId }) => {
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.competitor(organizationId, competitorId) });
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.competitors(organizationId) });
        },
    });
};

export const useDeleteCompetitor = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ organizationId, competitorId }: { organizationId: string; competitorId: string }) =>
            deleteCompetitorApi(organizationId, competitorId),
        onSuccess: (_, { organizationId }) => {
            queryClient.invalidateQueries({ queryKey: knowledgeKeys.competitors(organizationId) });
        },
    });
};

// Knowledge search hook
export const useSearchKnowledge = () => {
    return useMutation({
        mutationFn: ({ 
            organizationId, 
            data 
        }: { 
            organizationId: string; 
            data: KnowledgeSearchRequest 
        }) => searchKnowledgeApi(organizationId, data),
    });
};

// Combined hook for complete document upload workflow
export const useCompleteDocumentUpload = () => {
    const uploadDocument = useUploadDocument();
    const uploadFile = useUploadFileToSignedUrl();
    
    const uploadCompleteDocument = async (
        organizationId: string,
        file: File,
        documentData: Omit<DocumentUploadRequest, 'fileName' | 'fileSize' | 'mimeType'>,
        onProgress?: (progress: number) => void
    ) => {
        // Step 1: Initiate document upload
        const uploadRequest: DocumentUploadRequest = {
            ...documentData,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        };
        
        const uploadResponse = await uploadDocument.mutateAsync({
            organizationId,
            data: uploadRequest,
        });
        
        // Step 2: Upload file to signed URL
        await uploadFile.mutateAsync({
            signedUrl: uploadResponse.uploadUrl,
            file,
            onProgress,
        });
        
        // Step 3: Document processing is now automatic!
        // The storage service will call the webhook when upload is complete
        // Document status will be updated automatically
        
        return uploadResponse.document;
    };
    
    return {
        uploadCompleteDocument,
        isLoading: uploadDocument.isPending || uploadFile.isPending,
        error: uploadDocument.error || uploadFile.error,
        reset: () => {
            uploadDocument.reset();
            uploadFile.reset();
        },
    };
};
