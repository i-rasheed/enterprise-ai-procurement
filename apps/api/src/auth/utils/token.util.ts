import { createHash, randomUUID } from 'crypto';

export function createTokenId(): string {
  return randomUUID();
}

export function hashToken(tokenId: string): string {
  return createHash('sha256').update(tokenId).digest('hex');
}
