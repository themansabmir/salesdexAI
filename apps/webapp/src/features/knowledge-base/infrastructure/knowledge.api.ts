import { apiClient } from '@/lib/api-client';
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

// Document APIs
export const uploadDocumentApi = async (
    organizationId: string,
    data: DocumentUploadRequest
): Promise<DocumentUploadResponse> => {
    return apiClient.post<DocumentUploadResponse>(
        `/knowledge/organizations/${organizationId}/documents/upload`,
        data
    );
};

export const getDocumentsApi = async (
    organizationId: string,
    query?: DocumentQuery
): Promise<DocumentListResponse> => {
    return apiClient.get<DocumentListResponse>(
        `/knowledge/organizations/${organizationId}/documents`,
        { params: query }
    );
};

export const getDocumentApi = async (
    organizationId: string,
    documentId: string
): Promise<KnowledgeDocument> => {
    return apiClient.get<KnowledgeDocument>(
        `/knowledge/organizations/${organizationId}/documents/${documentId}`
    );
};

export const deleteDocumentApi = async (
    organizationId: string,
    documentId: string
): Promise<void> => {
    return apiClient.delete<void>(
        `/knowledge/organizations/${organizationId}/documents/${documentId}`
    );
};

export const getDocumentDownloadUrlApi = async (
    organizationId: string,
    documentId: string
): Promise<{ downloadUrl: string }> => {
    return apiClient.get<{ downloadUrl: string }>(
        `/knowledge/organizations/${organizationId}/documents/${documentId}/download`
    );
};

// Note: processDocumentApi removed - document processing should be triggered automatically
// by the storage service webhook when upload is complete

// Competitor APIs
export const createCompetitorApi = async (
    organizationId: string,
    data: CreateCompetitorRequest
): Promise<Competitor> => {
    return apiClient.post<Competitor>(
        `/knowledge/organizations/${organizationId}/competitors`,
        data
    );
};

export const getCompetitorsApi = async (
    organizationId: string,
    query?: CompetitorQuery
): Promise<CompetitorListResponse> => {
    return apiClient.get<CompetitorListResponse>(
        `/knowledge/organizations/${organizationId}/competitors`,
        { params: query }
    );
};

export const getCompetitorApi = async (
    organizationId: string,
    competitorId: string
): Promise<Competitor> => {
    return apiClient.get<Competitor>(
        `/knowledge/organizations/${organizationId}/competitors/${competitorId}`
    );
};

export const updateCompetitorApi = async (
    organizationId: string,
    competitorId: string,
    data: UpdateCompetitorRequest
): Promise<Competitor> => {
    return apiClient.put<Competitor>(
        `/knowledge/organizations/${organizationId}/competitors/${competitorId}`,
        data
    );
};

export const deleteCompetitorApi = async (
    organizationId: string,
    competitorId: string
): Promise<void> => {
    return apiClient.delete<void>(
        `/knowledge/organizations/${organizationId}/competitors/${competitorId}`
    );
};

// Knowledge Search API
export const searchKnowledgeApi = async (
    organizationId: string,
    data: KnowledgeSearchRequest
): Promise<KnowledgeSearchResponse> => {
    return apiClient.post<KnowledgeSearchResponse>(
        `/knowledge/organizations/${organizationId}/search`,
        data
    );
};

// File upload helper
export const uploadFileToSignedUrl = async (
    signedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(progress);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });
        
        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
};
