import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { type StringValue } from 'ms';
import ms from 'ms';
import { randomUUID } from 'crypto';

import { toSafeUser } from '../common/utils/user.util';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenPayload } from './types/refresh-token-payload.interface';
import { createTokenId, hashToken } from './utils/token.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const result = await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: dto.organisationName,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          role: Role.ADMIN,
          organisationId: organisation.id,
        },
      });

      return { organisation, user };
    });

    const tokens = await this.createTokenPair(result.user);

    return {
      user: tokens.user,
      organisation: {
        id: result.organisation.id,
        name: result.organisation.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.createTokenPair(user);
    const organisation = user.organisationId
      ? await this.prisma.organisation.findUnique({
          where: { id: user.organisationId },
          select: { id: true, name: true },
        })
      : null;

    return {
      user: tokens.user,
      organisation,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = hashToken(payload.jti);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.refreshTokenRepository.revokeFamily(payload.familyId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.refreshTokenRepository.revokeById(stored.id);

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createTokenPair(user, payload.familyId);
  }

  async logout(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = hashToken(payload.jti);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.refreshTokenRepository.revokeById(stored.id);
    }

    return {
      message: 'Logged out successfully',
    };
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        {
          secret: process.env.JWT_REFRESH_SECRET!,
        },
      );

      if (!payload.jti || !payload.familyId || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async createTokenPair(user: User, existingFamilyId?: string) {
    const familyId = existingFamilyId ?? randomUUID();
    const jti = createTokenId();

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        jti,
        familyId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
      },
    );

    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as StringValue;

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(jti),
      familyId,
      expiresAt: new Date(Date.now() + ms(refreshExpiresIn)),
    });

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }
}
