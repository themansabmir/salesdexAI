// File upload service interfaces and types
export interface FileUploadOptions {
    contentType: string;
    fileName?: string;
    path?: string;
    metadata?: Record<string, string>;
    public?: boolean;
    expiresIn?: number; // For signed URLs
}

export interface UploadResult {
    url: string;
    key: string;
    bucket?: string;
    contentType: string;
    size: number;
    metadata?: Record<string, string>;
    publicUrl?: string;
}

export interface SignedUrlResult {
    uploadUrl: string;
    key: string;
    expiresAt: Date;
    headers?: Record<string, string>;
    params?: Record<string, any>; // For Cloudinary-specific parameters
}

export interface DeleteResult {
    success: boolean;
    key: string;
}

export interface FileUploadAdapter {
    // Upload file directly
    uploadFile(file: Buffer | File, options: FileUploadOptions): Promise<UploadResult>;
    
    // Generate signed upload URL (for client-side uploads)
    generateSignedUploadUrl(options: FileUploadOptions): Promise<SignedUrlResult>;
    
    // Generate signed download URL
    generateSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    
    // Delete file
    deleteFile(key: string): Promise<DeleteResult>;
    
    // Check if file exists
    fileExists(key: string): Promise<boolean>;
    
    // Get file metadata
    getFileMetadata(key: string): Promise<Record<string, any> | null>;
    
    // List files (with optional prefix)
    listFiles(prefix?: string, maxKeys?: number): Promise<{
        files: Array<{
            key: string;
            size: number;
            lastModified: Date;
            contentType?: string;
        }>;
        isTruncated: boolean;
        nextContinuationToken?: string;
    }>;
}

export interface FileUploadServiceConfig {
    adapter: 'aws-s3' | 'google-cloud' | 'cloudinary' | 'minio';
    config: Record<string, any>;
}

// Error types
export class FileUploadError extends Error {
    constructor(
        message: string,
        public code: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'FileUploadError';
    }
}

export interface StorageConfig {
    // AWS S3
    aws?: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        bucket: string;
        endpoint?: string;
        forcePathStyle?: boolean;
    };
    
    // Google Cloud Storage
    googleCloud?: {
        projectId: string;
        keyFilename?: string;
        bucket: string;
        credentials?: {
            client_email: string;
            private_key: string;
        };
    };
    
    // Cloudinary
    cloudinary?: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
        folder?: string;
    };
    
    // MinIO
    minio?: {
        endPoint: string;
        port: number;
        useSSL: boolean;
        accessKey: string;
        secretKey: string;
        bucket: string;
        region?: string;
    };
}
