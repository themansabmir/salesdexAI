// Configuration validation and parsing utilities
export interface FileUploadConfig {
    adapter: string;
    config: Record<string, any>;
}

export interface AdapterConfig {
    validate(): void;
    isValid(): boolean;
}

export abstract class BaseAdapterConfig implements AdapterConfig {
    abstract validate(): void;
    
    isValid(): boolean {
        try {
            this.validate();
            return true;
        } catch {
            return false;
        }
    }
}

// AWS S3 Configuration
export interface AwsS3Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle?: boolean;
}

export class AwsS3ConfigValidator extends BaseAdapterConfig {
    constructor(private config: AwsS3Config) {
        super();
    }

    validate(): void {
        if (!this.config.accessKeyId) {
            throw new Error('AWS Access Key ID is required');
        }
        if (!this.config.secretAccessKey) {
            throw new Error('AWS Secret Access Key is required');
        }
        if (!this.config.region) {
            throw new Error('AWS Region is required');
        }
        if (!this.config.bucket) {
            throw new Error('AWS S3 Bucket is required');
        }
    }
}

// Google Cloud Storage Configuration
export interface GoogleCloudConfig {
    projectId: string;
    keyFilename?: string;
    bucket: string;
    credentials?: {
        client_email: string;
        private_key: string;
    };
}

export class GoogleCloudConfigValidator extends BaseAdapterConfig {
    constructor(private config: GoogleCloudConfig) {
        super();
    }

    validate(): void {
        if (!this.config.projectId) {
            throw new Error('Google Cloud Project ID is required');
        }
        if (!this.config.bucket) {
            throw new Error('Google Cloud Storage Bucket is required');
        }
        if (!this.config.keyFilename && !this.config.credentials) {
            throw new Error('Either keyFilename or credentials are required for Google Cloud Storage');
        }
    }
}

// Cloudinary Configuration
export interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
}

export class CloudinaryConfigValidator extends BaseAdapterConfig {
    constructor(private config: CloudinaryConfig) {
        super();
    }

    validate(): void {
        if (!this.config.cloudName) {
            throw new Error('Cloudinary Cloud Name is required');
        }
        if (!this.config.apiKey) {
            throw new Error('Cloudinary API Key is required');
        }
        if (!this.config.apiSecret) {
            throw new Error('Cloudinary API Secret is required');
        }
    }
}

// MinIO Configuration
export interface MinioConfig {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
}

export class MinioConfigValidator extends BaseAdapterConfig {
    constructor(private config: MinioConfig) {
        super();
    }

    validate(): void {
        if (!this.config.endPoint) {
            throw new Error('MinIO Endpoint is required');
        }
        if (!this.config.port || this.config.port <= 0) {
            throw new Error('MinIO Port must be a positive number');
        }
        if (!this.config.accessKey) {
            throw new Error('MinIO Access Key is required');
        }
        if (!this.config.secretKey) {
            throw new Error('MinIO Secret Key is required');
        }
        if (!this.config.bucket) {
            throw new Error('MinIO Bucket is required');
        }
    }
}

// Environment variable parser
export class EnvironmentConfigParser {
    static parseAwsS3(): AwsS3Config {
        return {
            accessKeyId: this.getRequiredEnv('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.getRequiredEnv('AWS_SECRET_ACCESS_KEY'),
            region: this.getRequiredEnv('AWS_REGION'),
            bucket: this.getRequiredEnv('AWS_S3_BUCKET'),
            endpoint: process.env.AWS_S3_ENDPOINT,
            forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
        };
    }

    static parseGoogleCloud(): GoogleCloudConfig {
        const config: GoogleCloudConfig = {
            projectId: this.getRequiredEnv('GC_PROJECT_ID'),
            bucket: this.getRequiredEnv('GC_BUCKET'),
        };

        const keyFilename = process.env.GC_KEY_FILENAME;
        if (keyFilename) {
            config.keyFilename = keyFilename;
        }

        const credentials = process.env.GC_CREDENTIALS;
        if (credentials) {
            try {
                config.credentials = JSON.parse(credentials);
            } catch (error) {
                throw new Error('Invalid GC_CREDENTIALS JSON format');
            }
        }

        return config;
    }

    static parseCloudinary(): CloudinaryConfig {
        return {
            cloudName: this.getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
            apiKey: this.getRequiredEnv('CLOUDINARY_API_KEY'),
            apiSecret: this.getRequiredEnv('CLOUDINARY_API_SECRET'),
            folder: process.env.CLOUDINARY_FOLDER,
        };
    }

    static parseMinio(): MinioConfig {
        return {
            endPoint: this.getRequiredEnv('MINIO_ENDPOINT'),
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: this.getRequiredEnv('MINIO_ACCESS_KEY'),
            secretKey: this.getRequiredEnv('MINIO_SECRET_KEY'),
            bucket: this.getRequiredEnv('MINIO_BUCKET'),
            region: process.env.MINIO_REGION,
        };
    }

    private static getRequiredEnv(key: string): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} is required`);
        }
        return value;
    }
}
