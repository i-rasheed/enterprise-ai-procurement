import { Injectable } from '@nestjs/common';
import { AuthTokenType } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    tokenHash: string;
    type: AuthTokenType;
    expiresAt: Date;
  }) {
    return this.prisma.authToken.create({ data });
  }

  findValidByHash(tokenHash: string, type: AuthTokenType) {
    return this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  markUsed(id: string) {
    return this.prisma.authToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  invalidateUserTokens(userId: string, type: AuthTokenType) {
    return this.prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
