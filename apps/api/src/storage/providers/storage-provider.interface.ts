export interface StorageUploadResult {
  key: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface StorageProvider {
  readonly name: string;
  upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
