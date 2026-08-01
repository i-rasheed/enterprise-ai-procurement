import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { STORAGE_PROVIDER } from './providers/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageProvider,
    S3StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (
        configService: ConfigService,
        local: LocalStorageProvider,
        s3: S3StorageProvider,
      ) => {
        const provider = configService.get<string>('STORAGE_PROVIDER', 'local');
        switch (provider) {
          case 's3':
          case 'minio':
          case 'r2':
            return s3;
          case 'azure':
          case 'local':
          default:
            return local;
        }
      },
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
