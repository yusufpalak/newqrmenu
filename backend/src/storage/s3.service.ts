import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

export interface IUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private client!: S3Client;
  private bucket!: string;
  private publicEndpoint!: string;
  private usePresigned = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const region = this.config.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.config.get<string>('S3_SECRET_KEY');
    const forcePathStyle =
      this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'S3 not configured (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY required)',
      );
    }

    this.bucket = this.config.get<string>('S3_BUCKET', 'qrmenu');
    this.publicEndpoint = this.config.get<string>(
      'S3_PUBLIC_ENDPOINT',
      endpoint,
    );
    this.usePresigned =
      this.config.get<string>('S3_USE_PRESIGNED', 'false') === 'true';

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.logger.log(`S3 client initialized (bucket=${this.bucket})`);
  }

  async upload(
    file: Express.Multer.File,
    folder = 'general',
  ): Promise<IUploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${folder}/${Date.now()}-${uuid()}${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );
    return {
      key,
      url: await this.getUrl(key),
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getUrl(key: string): Promise<string> {
    if (this.usePresigned) {
      return getSignedUrl(
        this.client,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: 3600 },
      );
    }
    return `${this.publicEndpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }
}
