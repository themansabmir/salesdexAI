import { FileUploadAdapter, FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult, FileUploadError } from '../fileupload.types';

// Abstract base class with common functionality
export abstract class BaseFileUploadAdapter implements FileUploadAdapter {
    protected abstract generateKey(options: FileUploadOptions): string;

    // Template method pattern - common structure with specific implementations
    async uploadFile(file: Buffer | File, options: FileUploadOptions): Promise<UploadResult> {
        try {
            this.validateOptions(options);
            const key = this.generateKey(options);
            const buffer = Buffer.isBuffer(file) ? file : await this.convertFileToBuffer(file);

            return this.performUpload(buffer, key, options);
        } catch (error) {
            throw this.handleError(error, 'upload');
        }
    }

    async generateSignedUploadUrl(options: FileUploadOptions): Promise<SignedUrlResult> {
        try {
            this.validateOptions(options);
            const key = this.generateKey(options);
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + (options.expiresIn || 3600));

            return this.performSignedUpload(key, options, expiresAt);
        } catch (error) {
            throw this.handleError(error, 'signed upload URL generation');
        }
    }

    async generateSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            if (!key) {
                throw new Error('File key is required');
            }
            return this.performSignedDownload(key, expiresIn);
        } catch (error) {
            throw this.handleError(error, 'signed download URL generation');
        }
    }

    async deleteFile(key: string): Promise<DeleteResult> {
        try {
            if (!key) {
                throw new Error('File key is required');
            }
            return this.performDelete(key);
        } catch (error) {
            throw this.handleError(error, 'file deletion');
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            if (!key) {
                throw new Error('File key is required');
            }
            return this.performFileExists(key);
        } catch (error) {
            throw this.handleError(error, 'file existence check');
        }
    }

    async getFileMetadata(key: string): Promise<Record<string, any> | null> {
        try {
            if (!key) {
                throw new Error('File key is required');
            }
            return this.performGetMetadata(key);
        } catch (error) {
            throw this.handleError(error, 'metadata retrieval');
        }
    }

    async listFiles(prefix?: string, maxKeys?: number): Promise<{
        files: Array<{
            key: string;
            size: number;
            lastModified: Date;
            contentType?: string;
        }>;
        isTruncated: boolean;
        nextContinuationToken?: string;
    }> {
        try {
            return this.performListFiles(prefix, maxKeys);
        } catch (error) {
            throw this.handleError(error, 'file listing');
        }
    }

    // Abstract methods to be implemented by concrete adapters
    protected abstract performUpload(buffer: Buffer, key: string, options: FileUploadOptions): Promise<UploadResult>;
    protected abstract performSignedUpload(key: string, options: FileUploadOptions, expiresAt: Date): Promise<SignedUrlResult>;
    protected abstract performSignedDownload(key: string, expiresIn: number): Promise<string>;
    protected abstract performDelete(key: string): Promise<DeleteResult>;
    protected abstract performFileExists(key: string): Promise<boolean>;
    protected abstract performGetMetadata(key: string): Promise<Record<string, any> | null>;
    protected abstract performListFiles(prefix?: string, maxKeys?: number): Promise<{
        files: Array<{
            key: string;
            size: number;
            lastModified: Date;
            contentType?: string;
        }>;
        isTruncated: boolean;
        nextContinuationToken?: string;
    }>;

    // Common utility methods
    protected validateOptions(options: FileUploadOptions): void {
        if (!options.contentType) {
            throw new Error('Content type is required');
        }
        if (options.expiresIn && options.expiresIn <= 0) {
            throw new Error('Expires in must be a positive number');
        }
    }

    protected handleError(error: any, operation: string): FileUploadError {
        const message = error instanceof Error ? error.message : `Unknown error during ${operation}`;
        const code = this.getErrorCode(operation);
        return new FileUploadError(message, code, error instanceof Error ? error : new Error(message));
    }

    protected getErrorCode(operation: string): string {
        const adapterName = this.constructor.name.replace('Adapter', '').toUpperCase();
        return `${adapterName}_${operation.replace(/\s+/g, '_').toUpperCase()}_ERROR`;
    }

    // Common key generation logic
    protected generateKeyFromOptions(options: FileUploadOptions): string {
        const path = options.path || '';
        const fileName = options.fileName || this.generateDefaultFileName();
        return path ? `${path}/${fileName}` : fileName;
    }

    protected generateDefaultFileName(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }

    // Common file conversion
    protected async convertFileToBuffer(file: File): Promise<Buffer> {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    // Common metadata processing
    protected processMetadata(metadata?: Record<string, string>): Record<string, string> {
        return metadata || {};
    }

    // Common URL generation
    protected generatePublicUrl(key: string, baseUrl?: string): string {
        if (baseUrl) {
            return `${baseUrl}/${key}`;
        }
        return `https://storage.example.com/${key}`;
    }
}
