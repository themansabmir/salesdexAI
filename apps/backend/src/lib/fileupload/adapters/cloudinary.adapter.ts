import { BaseFileUploadAdapter } from './base.adapter';
import { FileUploadOptions, UploadResult, SignedUrlResult, DeleteResult } from '../fileupload.types';

export class CloudinaryAdapter extends BaseFileUploadAdapter {
    private cloudinary: any;
    private folder: string;

    constructor(config: { cloudName: string; apiKey: string; apiSecret: string; folder?: string }) {
        super();
        this.folder = config.folder || 'uploads';
        
        // Import Cloudinary SDK dynamically
        const cloudinary = require('cloudinary').v2;
        
        cloudinary.config({
            cloud_name: config.cloudName,
            api_key: config.apiKey,
            api_secret: config.apiSecret,
        });
        
        this.cloudinary = cloudinary;
    }

    protected generateKey(options: FileUploadOptions): string {
        return this.generateKeyFromOptions(options);
    }

    protected async performUpload(buffer: Buffer, key: string, options: FileUploadOptions): Promise<UploadResult> {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: this.folder,
                    public_id: key,
                    context: options.metadata,
                    format: this.getFormatFromContentType(options.contentType),
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        const uploadResult = result as any;

        return {
            url: uploadResult.secure_url,
            key: uploadResult.public_id,
            bucket: this.folder,
            contentType: options.contentType,
            size: uploadResult.bytes || buffer.length,
            metadata: options.metadata,
            publicUrl: uploadResult.secure_url,
        };
    }

    protected async performSignedUpload(key: string, options: FileUploadOptions, expiresAt: Date): Promise<SignedUrlResult> {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = this.cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder: this.folder,
                public_id: key,
                context: options.metadata,
            },
            this.cloudinary.config().api_secret
        );

        const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/auto/upload`;

        return {
            uploadUrl,
            key,
            expiresAt,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                api_key: this.cloudinary.config().api_key,
                timestamp,
                signature,
                folder: this.folder,
                public_id: key,
                context: options.metadata,
            },
        };
    }

    protected async performSignedDownload(key: string, expiresIn: number): Promise<string> {
        const url = this.cloudinary.url(key, {
            secure: true,
            type: 'upload',
            resource_type: 'auto',
            expires_at: Math.round(Date.now() / 1000) + expiresIn,
        });

        return url;
    }

    protected async performDelete(key: string): Promise<DeleteResult> {
        await this.cloudinary.uploader.destroy(key, {
            resource_type: 'auto',
        });

        return { success: true, key };
    }

    protected async performFileExists(key: string): Promise<boolean> {
        try {
            const result = await this.cloudinary.api.resource(key, {
                resource_type: 'auto',
            });
            return !!result;
        } catch {
            return false;
        }
    }

    protected async performGetMetadata(key: string): Promise<Record<string, any> | null> {
        try {
            const result = await this.cloudinary.api.resource(key, {
                resource_type: 'auto',
            });

            return {
                size: result.bytes,
                contentType: result.resource_type === 'image' ? `image/${result.format}` : result.resource_type,
                lastModified: new Date(result.created_at * 1000),
                metadata: result.context,
                etag: result.etag,
                format: result.format,
                resourceType: result.resource_type,
                width: result.width,
                height: result.height,
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
        const result = await this.cloudinary.api.resources({
            type: 'upload',
            prefix: prefix ? `${this.folder}/${prefix}` : this.folder,
            max_results: maxKeys,
            resource_type: 'auto',
        });

        const files = result.resources.map((resource: any) => ({
            key: resource.public_id.replace(`${this.folder}/`, ''),
            size: resource.bytes,
            lastModified: new Date(resource.created_at * 1000),
            contentType: resource.resource_type === 'image' ? `image/${resource.format}` : resource.resource_type,
        }));

        return {
            files,
            isTruncated: result.next_cursor !== undefined,
            nextContinuationToken: result.next_cursor,
        };
    }

    private getFormatFromContentType(contentType: string): string {
        const typeToFormat: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav',
            'application/pdf': 'pdf',
        };

        return typeToFormat[contentType] || 'auto';
    }
}
