import { BaseFileUploadAdapter } from './base.adapter';
import { FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult } from '../fileupload.types';

export class MinioAdapter extends BaseFileUploadAdapter {
    private minioClient: any;
    private bucket: string;
    private region: string;

    constructor(config: { endPoint: string; port: number; useSSL: boolean; accessKey: string; secretKey: string; bucket: string; region?: string }) {
        super();
        this.bucket = config.bucket;
        this.region = config.region || 'us-east-1';
        
        // Import MinIO SDK dynamically
        const Minio = require('minio');
        
        this.minioClient = new Minio.Client({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
        });
    }

    protected generateKey(options: FileUploadOptions): string {
        return this.generateKeyFromOptions(options);
    }

    protected async performUpload(buffer: Buffer, key: string, options: FileUploadOptions): Promise<UploadResult> {
        await this.minioClient.putObject(this.bucket, key, buffer, undefined, {
            'Content-Type': options.contentType,
            ...(options.metadata || {}),
        });

        const url = await this.getFileUrl(key);

        return {
            url,
            key,
            bucket: this.bucket,
            contentType: options.contentType,
            size: buffer.length,
            metadata: options.metadata,
            publicUrl: url,
        };
    }

    protected async performSignedUpload(key: string, options: FileUploadOptions, expiresAt: Date): Promise<SignedUrlResult> {
        const uploadUrl = await this.minioClient.presignedPutObject(this.bucket, key, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

        return {
            uploadUrl,
            key,
            expiresAt,
            headers: {
                'Content-Type': options.contentType,
                ...(options.metadata || {}),
            },
        };
    }

    protected async performSignedDownload(key: string, expiresIn: number): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucket, key, expiresIn);
    }

    protected async performDelete(key: string): Promise<DeleteResult> {
        await this.minioClient.removeObject(this.bucket, key);
        return { success: true, key };
    }

    protected async performFileExists(key: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucket, key);
            return true;
        } catch {
            return false;
        }
    }

    protected async performGetMetadata(key: string): Promise<Record<string, any> | null> {
        try {
            const stat = await this.minioClient.statObject(this.bucket, key);
            return {
                size: stat.size,
                contentType: stat.metaData['content-type'],
                lastModified: stat.lastModified,
                metadata: stat.metaData,
                etag: stat.etag,
            };
        } catch {
            return null;
        }
    }

    protected async performListFiles(prefix?: string, maxKeys: number = 1000): Promise<{
        files: Array<{
            key: string;
            size: number;
            lastModified: Date;
            contentType?: string;
        }>;
        isTruncated: boolean;
        nextContinuationToken?: string;
    }> {
        const stream = this.minioClient.listObjects(this.bucket, prefix || '', true);
        const files: any[] = [];
        
        return new Promise((resolve, reject) => {
            stream.on('data', (obj: any) => {
                if (files.length < maxKeys) {
                    files.push({
                        key: obj.name,
                        size: obj.size,
                        lastModified: obj.lastModified,
                    });
                }
            });
            
            stream.on('end', () => {
                resolve({
                    files,
                    isTruncated: false,
                });
            });
            
            stream.on('error', (error: Error) => {
                reject(new Error(`Failed to list files from MinIO: ${error.message}`));
            });
        });
    }

    private async getFileUrl(key: string): Promise<string> {
        try {
            return await this.minioClient.presignedGetObject(this.bucket, key, 24 * 60 * 60); // 24 hours
        } catch {
            // Fallback to constructed URL
            return `http://${this.minioClient.host}:${this.minioClient.port}/${this.bucket}/${key}`;
        }
    }
}
