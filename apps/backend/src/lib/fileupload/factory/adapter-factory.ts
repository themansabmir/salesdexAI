import { FileUploadAdapter } from '../fileupload.types';
import { AwsS3Adapter } from '../adapters/aws-s3.adapter';
import { MinioAdapter } from '../adapters/minio.adapter';
import { CloudinaryAdapter } from '../adapters/cloudinary.adapter';
import { GoogleCloudAdapter } from '../adapters/google-cloud.adapter';

// Abstract factory for creating adapters
export abstract class AdapterFactory {
    abstract createAdapter(config: any): FileUploadAdapter;
    abstract getAdapterType(): string;
}

// AWS S3 Factory
export class AwsS3AdapterFactory extends AdapterFactory {
    getAdapterType(): string {
        return 'aws-s3';
    }

    createAdapter(config: any): FileUploadAdapter {
        return new AwsS3Adapter(config);
    }
}

// Google Cloud Storage Factory
export class GoogleCloudAdapterFactory extends AdapterFactory {
    getAdapterType(): string {
        return 'google-cloud';
    }

    createAdapter(config: any): FileUploadAdapter {
        return new GoogleCloudAdapter(config);
    }
}

// Cloudinary Factory
export class CloudinaryAdapterFactory extends AdapterFactory {
    getAdapterType(): string {
        return 'cloudinary';
    }

    createAdapter(config: any): FileUploadAdapter {
        return new CloudinaryAdapter(config);
    }
}

// MinIO Factory
export class MinioAdapterFactory extends AdapterFactory {
    getAdapterType(): string {
        return 'minio';
    }

    createAdapter(config: any): FileUploadAdapter {
        return new MinioAdapter(config);
    }
}

// Factory registry - follows Open/Closed Principle
export class AdapterFactoryRegistry {
    private static factories = new Map<string, AdapterFactory>([
        ['aws-s3', new AwsS3AdapterFactory()],
        ['google-cloud', new GoogleCloudAdapterFactory()],
        ['cloudinary', new CloudinaryAdapterFactory()],
        ['minio', new MinioAdapterFactory()],
    ]);

    static registerFactory(adapterType: string, factory: AdapterFactory): void {
        this.factories.set(adapterType, factory);
    }

    static getFactory(adapterType: string): AdapterFactory {
        const factory = this.factories.get(adapterType);
        if (!factory) {
            throw new Error(`Unsupported adapter type: ${adapterType}`);
        }
        return factory;
    }

    static getSupportedAdapters(): string[] {
        return Array.from(this.factories.keys());
    }

    static isSupported(adapterType: string): boolean {
        return this.factories.has(adapterType);
    }
}
