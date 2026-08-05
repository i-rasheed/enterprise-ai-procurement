import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  StorageProvider,
  StorageUploadResult,
} from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly basePath: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>(
      'STORAGE_LOCAL_PATH',
      './uploads',
    );
  }

  async upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    const filePath = join(this.basePath, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      mimeType,
    };
  }

  async download(key: string): Promise<Buffer> {
    return readFile(join(this.basePath, key));
  }

  async delete(key: string): Promise<void> {
    await unlink(join(this.basePath, key)).catch(() => undefined);
  }

  getUrl(key: string): string {
    return `/storage/${key}`;
  }
}
