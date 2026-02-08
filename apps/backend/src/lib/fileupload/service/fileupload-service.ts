import { FileUploadAdapter, FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult } from '../fileupload.types';
import { AdapterFactoryRegistry } from '../factory/adapter-factory';
import { EnvironmentConfigParser } from '../config/config-validator';

// Service builder following Builder Pattern
export class FileUploadServiceBuilder {
    private adapterType?: string;
    private config?: any;

    withAdapter(adapterType: string): this {
        this.adapterType = adapterType;
        return this;
    }

    withConfig(config: any): this {
        this.config = config;
        return this;
    }

    build(): FileUploadService {
        if (!this.adapterType || !this.config) {
            throw new Error('Adapter type and config are required');
        }

        const factory = AdapterFactoryRegistry.getFactory(this.adapterType);
        const adapter = factory.createAdapter(this.config);

        return new FileUploadService(adapter, this.adapterType);
    }

    // Static factory methods for convenience
    static awsS3(config: any): FileUploadServiceBuilder {
        return new FileUploadServiceBuilder()
            .withAdapter('aws-s3')
            .withConfig(config);
    }

    static googleCloud(config: any): FileUploadServiceBuilder {
        return new FileUploadServiceBuilder()
            .withAdapter('google-cloud')
            .withConfig(config);
    }

    static cloudinary(config: any): FileUploadServiceBuilder {
        return new FileUploadServiceBuilder()
            .withAdapter('cloudinary')
            .withConfig(config);
    }

    static minio(config: any): FileUploadServiceBuilder {
        return new FileUploadServiceBuilder()
            .withAdapter('minio')
            .withConfig(config);
    }

    static fromEnvironment(): FileUploadService {
        const adapterType = process.env.FILE_UPLOAD_ADAPTER || 'aws-s3';
        
        let config: any;
        switch (adapterType) {
            case 'aws-s3':
                config = EnvironmentConfigParser.parseAwsS3();
                break;
            case 'google-cloud':
                config = EnvironmentConfigParser.parseGoogleCloud();
                break;
            case 'cloudinary':
                config = EnvironmentConfigParser.parseCloudinary();
                break;
            case 'minio':
                config = EnvironmentConfigParser.parseMinio();
                break;
            default:
                throw new Error(`Unsupported adapter type: ${adapterType}`);
        }

        return new FileUploadServiceBuilder()
            .withAdapter(adapterType)
            .withConfig(config)
            .build();
    }
}

// Refactored FileUploadService - Single Responsibility
export class FileUploadService {
    private readonly adapter: FileUploadAdapter;
    private readonly adapterType: string;

    constructor(adapter: FileUploadAdapter, adapterType: string) {
        this.adapter = adapter;
        this.adapterType = adapterType;
    }

    // Core upload operations - delegates to adapter
    async uploadFile(file: Buffer | File, options: FileUploadOptions): Promise<UploadResult> {
        return this.adapter.uploadFile(file, options);
    }

    async generateSignedUploadUrl(options: FileUploadOptions): Promise<SignedUrlResult> {
        return this.adapter.generateSignedUploadUrl(options);
    }

    async generateSignedDownloadUrl(key: string, expiresIn?: number): Promise<string> {
        return this.adapter.generateSignedDownloadUrl(key, expiresIn);
    }

    async deleteFile(key: string): Promise<DeleteResult> {
        return this.adapter.deleteFile(key);
    }

    async fileExists(key: string): Promise<boolean> {
        return this.adapter.fileExists(key);
    }

    async getFileMetadata(key: string): Promise<Record<string, any> | null> {
        return this.adapter.getFileMetadata(key);
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
        return this.adapter.listFiles(prefix, maxKeys);
    }

    // Information methods
    getAdapterType(): string {
        return this.adapterType;
    }

    // Health check method
    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; adapter: string; error?: string }> {
        try {
            // Try to list files with a very small limit to check connectivity
            await this.adapter.listFiles('', 1);
            return { status: 'healthy', adapter: this.adapterType };
        } catch (error) {
            return { 
                status: 'unhealthy', 
                adapter: this.adapterType, 
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

// Legacy factory methods for backward compatibility
export class FileUploadServiceFactory {
    static createAwsS3(config: any): FileUploadService {
        return FileUploadServiceBuilder.awsS3(config).build();
    }

    static createGoogleCloud(config: any): FileUploadService {
        return FileUploadServiceBuilder.googleCloud(config).build();
    }

    static createCloudinary(config: any): FileUploadService {
        return FileUploadServiceBuilder.cloudinary(config).build();
    }

    static createMinio(config: any): FileUploadService {
        return FileUploadServiceBuilder.minio(config).build();
    }

    static createFromEnv(): FileUploadService {
        return FileUploadServiceBuilder.fromEnvironment();
    }
}
