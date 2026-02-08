import { BaseFileUploadAdapter } from './base.adapter';
import { FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult } from '../fileupload.types';

export class AwsS3Adapter extends BaseFileUploadAdapter {
    private s3Client: any;
    private bucket: string;

    constructor(config: { accessKeyId: string; secretAccessKey: string; region: string; bucket: string; endpoint?: string; forcePathStyle?: boolean }) {
        super();
        this.bucket = config.bucket;
        this.initializeS3Client(config);
    }

    private initializeS3Client(config: any): void {
        // Import AWS SDK dynamically to avoid dependency issues
        const AWS = require('aws-sdk');
        
        const s3Config: any = {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region: config.region,
        };

        if (config.endpoint) {
            s3Config.endpoint = config.endpoint;
            s3Config.s3ForcePathStyle = config.forcePathStyle || false;
        }

        this.s3Client = new AWS.S3(s3Config);
    }

    protected generateKey(options: FileUploadOptions): string {
        return this.generateKeyFromOptions(options);
    }

    protected async performUpload(buffer: Buffer, key: string, options: FileUploadOptions): Promise<UploadResult> {
        const params = {
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: options.contentType,
            Metadata: this.processMetadata(options.metadata),
            ACL: options.public ? 'public-read' : 'private',
        };

        const result = await this.s3Client.upload(params).promise();

        return {
            url: result.Location,
            key: result.Key,
            bucket: result.Bucket,
            contentType: options.contentType,
            size: buffer.length,
            metadata: options.metadata,
            publicUrl: options.public ? result.Location : undefined,
        };
    }

    protected async performSignedUpload(key: string, options: FileUploadOptions, expiresAt: Date): Promise<SignedUrlResult> {
        const params = {
            Bucket: this.bucket,
            Key: key,
            Expires: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
            ContentType: options.contentType,
            Metadata: this.processMetadata(options.metadata),
        };

        const uploadUrl = await this.s3Client.getSignedUrl('putObject', params);

        return {
            uploadUrl,
            key,
            expiresAt,
            headers: {
                'Content-Type': options.contentType,
                ...(options.metadata && Object.keys(options.metadata).reduce((acc, key) => {
                    acc[`x-amz-meta-${key}`] = options.metadata![key];
                    return acc;
                }, {} as Record<string, string>)),
            },
        };
    }

    protected async performSignedDownload(key: string, expiresIn: number): Promise<string> {
        const params = {
            Bucket: this.bucket,
            Key: key,
            Expires: expiresIn,
        };

        return await this.s3Client.getSignedUrl('getObject', params);
    }

    protected async performDelete(key: string): Promise<DeleteResult> {
        await this.s3Client.deleteObject({
            Bucket: this.bucket,
            Key: key,
        }).promise();

        return { success: true, key };
    }

    protected async performFileExists(key: string): Promise<boolean> {
        try {
            await this.s3Client.headObject({
                Bucket: this.bucket,
                Key: key,
            }).promise();
            return true;
        } catch {
            return false;
        }
    }

    protected async performGetMetadata(key: string): Promise<Record<string, any> | null> {
        try {
            const result = await this.s3Client.headObject({
                Bucket: this.bucket,
                Key: key,
            }).promise();

            return {
                size: result.ContentLength,
                contentType: result.ContentType,
                lastModified: result.LastModified,
                metadata: result.Metadata,
                etag: result.ETag,
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
        const params: any = {
            Bucket: this.bucket,
            MaxKeys: maxKeys,
        };

        if (prefix) {
            params.Prefix = prefix;
        }

        const result = await this.s3Client.listObjectsV2(params).promise();

        return {
            files: (result.Contents || []).map((obj: any) => ({
                key: obj.Key!,
                size: obj.Size!,
                lastModified: obj.LastModified!,
            })),
            isTruncated: result.IsTruncated || false,
            nextContinuationToken: result.NextContinuationToken,
        };
    }
}
