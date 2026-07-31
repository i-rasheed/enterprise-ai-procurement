import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  revokeById(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeFamily(familyId: string): Promise<number> {
    return this.prisma.refreshToken
      .updateMany({
        where: {
          familyId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      })
      .then((result) => result.count);
  }

  revokeAllForUser(userId: string): Promise<number> {
    return this.prisma.refreshToken
      .updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      })
      .then((result) => result.count);
  }
}
