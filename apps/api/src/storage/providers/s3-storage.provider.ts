import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import type { EnvConfig } from '../../config/env.schema';
import {
  StorageProvider,
  StorageUploadResult,
} from './storage-provider.interface';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  readonly name: string;
  private client: S3Client | null = null;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.name = this.configService.get<string>('STORAGE_PROVIDER', 's3');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
  }

  private getClient(): S3Client {
    if (this.client) return this.client;

    const region = this.configService.get<string>('AWS_S3_REGION', 'us-east-1');
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });
    return this.client;
  }

  async upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    if (!this.bucket) {
      throw new ServiceUnavailableException('S3 bucket not configured');
    }

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      mimeType,
    };
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.getClient().send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const bytes = await response.Body?.transformToByteArray();
    return Buffer.from(bytes ?? []);
  }

  async delete(key: string): Promise<void> {
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getUrl(key: string): string {
    const region =
      this.configService.get<EnvConfig['AWS_S3_REGION']>('AWS_S3_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
