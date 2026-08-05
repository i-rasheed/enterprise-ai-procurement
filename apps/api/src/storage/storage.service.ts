import { Inject, Injectable } from '@nestjs/common';

import { STORAGE_PROVIDER } from './providers/storage-provider.interface';
import type { StorageProvider } from './providers/storage-provider.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
  ) {}

  upload(key: string, buffer: Buffer, mimeType: string) {
    return this.provider.upload(key, buffer, mimeType);
  }

  download(key: string) {
    return this.provider.download(key);
  }

  delete(key: string) {
    return this.provider.delete(key);
  }

  getUrl(key: string) {
    return this.provider.getUrl(key);
  }

  getProviderName() {
    return this.provider.name;
  }
}
