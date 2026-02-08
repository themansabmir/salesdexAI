import { FileUploadService, FileUploadOptions, UploadResult, SignedUrlResult } from '@/lib/fileupload';

export interface IStorageService {
    generateUploadUrl(filename: string, contentType: string, expiresIn?: number): Promise<{
        uploadUrl: string;
        storageKey: string;
        expiresAt: Date;
    }>;
    generateDownloadUrl(storageKey: string, expiresIn?: number): Promise<string>;
    deleteFile(storageKey: string): Promise<void>;
}

export class StorageService implements IStorageService {
    private fileUploadService: FileUploadService;

    constructor(fileUploadService: FileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    async generateUploadUrl(filename: string, contentType: string, expiresIn: number = 3600): Promise<{
        uploadUrl: string;
        storageKey: string;
        expiresAt: Date;
    }> {
        const result = await this.fileUploadService.generateSignedUploadUrl({
            fileName: filename,
            contentType,
            expiresIn,
        });

        return {
            uploadUrl: result.uploadUrl,
            storageKey: result.key,
            expiresAt: result.expiresAt,
        };
    }

    async generateDownloadUrl(storageKey: string, expiresIn: number = 3600): Promise<string> {
        return this.fileUploadService.generateSignedDownloadUrl(storageKey, expiresIn);
    }

    async deleteFile(storageKey: string): Promise<void> {
        try {
            await this.fileUploadService.deleteFile(storageKey);
        } catch (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }

    // Additional utility methods (not part of interface but useful)
    getAdapterType(): string {
        return this.fileUploadService.getAdapterType();
    }

    async getFileMetadata(fileKey: string) {
        return this.fileUploadService.getFileMetadata(fileKey);
    }

    async listFiles(prefix?: string, maxKeys?: number) {
        return this.fileUploadService.listFiles(prefix, maxKeys);
    }

    async uploadFile(file: Buffer | File, options: FileUploadOptions): Promise<UploadResult> {
        return this.fileUploadService.uploadFile(file, options);
    }

    async fileExists(fileKey: string): Promise<boolean> {
        return this.fileUploadService.fileExists(fileKey);
    }
}
