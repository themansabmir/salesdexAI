import { BaseFileUploadAdapter } from './base.adapter';
import { FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult } from '../fileupload.types';

export class GoogleCloudAdapter extends BaseFileUploadAdapter {
    private storage: any;
    private bucket: any;
    private bucketName: string;

    constructor(config: { projectId: string; keyFilename?: string; bucket: string; credentials?: any }) {
        super();
        this.bucketName = config.bucket;
        
        // Import Google Cloud Storage SDK dynamically
        const { Storage } = require('@google-cloud/storage');
        
        const storageConfig: any = {
            projectId: config.projectId,
        };

        if (config.keyFilename) {
            storageConfig.keyFilename = config.keyFilename;
        } else if (config.credentials) {
            storageConfig.credentials = config.credentials;
        }

        this.storage = new Storage(storageConfig);
        this.bucket = this.storage.bucket(config.bucket);
    }

    protected generateKey(options: FileUploadOptions): string {
        return this.generateKeyFromOptions(options);
    }

    protected async performUpload(buffer: Buffer, key: string, options: FileUploadOptions): Promise<UploadResult> {
        const fileObj = this.bucket.file(key);
        const stream = fileObj.createWriteStream({
            metadata: {
                contentType: options.contentType,
                metadata: options.metadata || {},
            },
        });

        await new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', resolve);
            stream.end(buffer);
        });

        // Make file public if requested
        if (options.public) {
            await fileObj.makePublic();
        }

        const [metadata] = await fileObj.getMetadata();

        return {
            url: `https://storage.googleapis.com/${this.bucketName}/${key}`,
            key,
            bucket: this.bucketName,
            contentType: options.contentType,
            size: buffer.length,
            metadata: options.metadata,
            publicUrl: options.public ? `https://storage.googleapis.com/${this.bucketName}/${key}` : undefined,
        };
    }

    protected async performSignedUpload(key: string, options: FileUploadOptions, expiresAt: Date): Promise<SignedUrlResult> {
        const [uploadUrl] = await this.bucket.file(key).getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: expiresAt,
            contentType: options.contentType,
        });

        return {
            uploadUrl,
            key,
            expiresAt,
            headers: {
                'Content-Type': options.contentType,
                ...(options.metadata && Object.keys(options.metadata).reduce((acc, key) => {
                    acc[`x-goog-meta-${key}`] = options.metadata![key];
                    return acc;
                }, {} as Record<string, string>)),
            },
        };
    }

    protected async performSignedDownload(key: string, expiresIn: number): Promise<string> {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        const [downloadUrl] = await this.bucket.file(key).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expiresAt,
        });

        return downloadUrl;
    }

    protected async performDelete(key: string): Promise<DeleteResult> {
        await this.bucket.file(key).delete();
        return { success: true, key };
    }

    protected async performFileExists(key: string): Promise<boolean> {
        const [exists] = await this.bucket.file(key).exists();
        return exists;
    }

    protected async performGetMetadata(key: string): Promise<Record<string, any> | null> {
        const [metadata] = await this.bucket.file(key).getMetadata();

        return {
            size: parseInt(metadata.size),
            contentType: metadata.contentType,
            lastModified: new Date(metadata.updated),
            metadata: metadata.metadata,
            etag: metadata.etag,
            generation: metadata.generation,
        };
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
        const options: any = {
            maxResults: maxKeys,
        };

        if (prefix) {
            options.prefix = prefix;
        }

        const [files, , query] = await this.bucket.getFiles(options);

        const fileList = files.map((file: any) => ({
            key: file.name,
            size: parseInt(file.metadata.size),
            lastModified: new Date(file.metadata.updated),
            contentType: file.metadata.contentType,
        }));

        return {
            files: fileList,
            isTruncated: !!query.pageToken,
            nextContinuationToken: query.pageToken,
        };
    }
}
