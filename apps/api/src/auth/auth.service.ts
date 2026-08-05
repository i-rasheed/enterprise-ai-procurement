import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditAction, AuthTokenType, User, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { type StringValue } from 'ms';
import ms from 'ms';
import { randomUUID } from 'crypto';

import { AuditService } from '../audit/audit.service';
import { assertPasswordPolicy } from '../common/pipes/sanitize-input.pipe';
import { toSafeUser } from '../common/utils/user.util';
import { PrismaService } from '../database/prisma.service';
import { TRIAL_DAYS } from '../billing/constants/plan.constants';
import { toOrganisationSlug } from '../organisations/utils/organisation-slug.util';
import { JobService } from '../jobs/job.service';
import { UsersService } from '../users/users.service';
import { AuthTokenRepository } from './auth-token.repository';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenPayload } from './types/refresh-token-payload.interface';
import { createTokenId, hashToken } from './utils/token.util';
import { REGISTRATION_PENDING_EXPIRY_HOURS } from './constants/registration.constants';
import { PendingOrganisationRegistrationRepository } from './pending-organisation-registration.repository';
import { assertWorkEmail } from './utils/work-email.util';

export type AuthContext = {
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly jobService: JobService,
    private readonly pendingRegistrationRepository: PendingOrganisationRegistrationRepository,
  ) {}

  async register(dto: RegisterDto, context: AuthContext = {}) {
    assertPasswordPolicy(dto.password);
    this.assertWorkEmailAllowed(dto.email);

    await this.pendingRegistrationRepository.deleteExpired();

    const normalizedEmail = dto.email.trim().toLowerCase();
    const slug = toOrganisationSlug(dto.organisationName);

    await this.assertOrganisationSlugAvailable(slug);

    const existingUser =
      await this.usersService.findFirstByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);
    const plainToken = createTokenId();
    const tokenHash = hashToken(plainToken);
    const expiresAt = this.buildPendingRegistrationExpiry();

    const existingPending =
      await this.pendingRegistrationRepository.findByEmail(normalizedEmail);

    if (existingPending) {
      if (existingPending.slug !== slug) {
        await this.assertOrganisationSlugAvailable(slug, existingPending.id);
      }

      await this.pendingRegistrationRepository.update(existingPending.id, {
        organisationName: dto.organisationName,
        slug,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        tokenHash,
        expiresAt,
      });
    } else {
      await this.pendingRegistrationRepository.create({
        email: normalizedEmail,
        organisationName: dto.organisationName,
        slug,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        tokenHash,
        expiresAt,
      });
    }

    await this.sendPendingRegistrationEmail(
      normalizedEmail,
      dto.organisationName,
      plainToken,
    );

    await this.auditService.logAuth(AuditAction.AUTH_REGISTER, {
      metadata: {
        email: normalizedEmail,
        organisationName: dto.organisationName,
        pendingVerification: true,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      correlationId: context.correlationId,
    });

    return {
      message:
        'We sent a verification link to your work email. Your organisation will be created after you verify.',
      email: normalizedEmail,
      verificationRequired: true,
      ...(process.env.NODE_ENV === 'test' && {
        verificationToken: plainToken,
      }),
    };
  }

  async login(dto: LoginDto, context: AuthContext = {}) {
    const user = await this.usersService.findFirstByEmail(dto.email);

    if (!user) {
      await this.handleFailedLogin(dto.email, context);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Account is temporarily locked due to failed login attempts.',
      );
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(dto.email, context, user);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const tokens = await this.createTokenPair(user);
    const organisation = user.organisationId
      ? await this.prisma.organisation.findUnique({
          where: { id: user.organisationId },
          select: { id: true, name: true },
        })
      : null;

    await this.auditService.logAuth(AuditAction.AUTH_LOGIN, {
      userId: user.id,
      organisationId: user.organisationId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      correlationId: context.correlationId,
    });

    return {
      user: tokens.user,
      organisation,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      mfaRequired: user.mfaEnabled,
    };
  }

  async refresh(dto: RefreshTokenDto, context: AuthContext = {}) {
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

    await this.auditService.logAuth(AuditAction.AUTH_TOKEN_REFRESH, {
      userId: user.id,
      organisationId: user.organisationId,
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return this.createTokenPair(user, payload.familyId);
  }

  async logout(dto: RefreshTokenDto, context: AuthContext = {}) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = hashToken(payload.jti);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.refreshTokenRepository.revokeById(stored.id);
    }

    await this.auditService.logAuth(AuditAction.AUTH_LOGOUT, {
      userId: payload.sub,
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return { message: 'Logged out successfully' };
  }

  async revokeAllSessions(userId: string, context: AuthContext = {}) {
    const count = await this.refreshTokenRepository.revokeAllForUser(userId);

    await this.auditService.logAuth(AuditAction.AUTH_TOKEN_REVOKE, {
      userId,
      metadata: { revokedCount: count },
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return { message: 'All sessions revoked', revokedCount: count };
  }

  async forgotPassword(email: string, context: AuthContext = {}) {
    const user = await this.usersService.findFirstByEmail(email);

    if (user) {
      await this.authTokenRepository.invalidateUserTokens(
        user.id,
        AuthTokenType.PASSWORD_RESET,
      );

      const rawToken = createTokenId();
      const expiresAt = new Date(Date.now() + ms('1h'));

      await this.authTokenRepository.create({
        userId: user.id,
        tokenHash: hashToken(rawToken),
        type: AuthTokenType.PASSWORD_RESET,
        expiresAt,
      });

      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      await this.jobService.enqueueEmail({
        to: user.email,
        subject: 'Reset your SpendWise password',
        html: `<p>Use this link to reset your password (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });

      await this.auditService.logAuth(AuditAction.AUTH_PASSWORD_RESET_REQUEST, {
        userId: user.id,
        organisationId: user.organisationId,
        ipAddress: context.ipAddress,
        correlationId: context.correlationId,
      });
    }

    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string, context: AuthContext = {}) {
    assertPasswordPolicy(password);

    const stored = await this.authTokenRepository.findValidByHash(
      hashToken(token),
      AuthTokenType.PASSWORD_RESET,
    );

    if (!stored) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.authToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.refreshTokenRepository.revokeAllForUser(stored.userId);

    await this.auditService.logAuth(AuditAction.AUTH_PASSWORD_RESET, {
      userId: stored.userId,
      organisationId: stored.user.organisationId,
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string, context: AuthContext = {}) {
    const pending = await this.pendingRegistrationRepository.findByTokenHash(
      hashToken(token),
    );

    if (pending) {
      return this.completePendingRegistration(pending, context);
    }

    const stored = await this.authTokenRepository.findValidByHash(
      hashToken(token),
      AuthTokenType.EMAIL_VERIFICATION,
    );

    if (!stored) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { isVerified: true },
      }),
      this.prisma.authToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.auditService.logAuth(AuditAction.AUTH_EMAIL_VERIFIED, {
      userId: stored.userId,
      organisationId: stored.user.organisationId,
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return { message: 'Email verified successfully', isVerified: true };
  }

  async resendRegistrationVerification(
    email: string,
    context: AuthContext = {},
  ) {
    await this.pendingRegistrationRepository.deleteExpired();

    const normalizedEmail = email.trim().toLowerCase();
    const pending =
      await this.pendingRegistrationRepository.findByEmail(normalizedEmail);

    if (!pending || pending.expiresAt < new Date()) {
      return {
        message:
          'If a pending registration exists for this email, a new verification link has been sent.',
      };
    }

    const plainToken = createTokenId();
    const expiresAt = this.buildPendingRegistrationExpiry();

    await this.pendingRegistrationRepository.update(pending.id, {
      tokenHash: hashToken(plainToken),
      expiresAt,
    });

    await this.sendPendingRegistrationEmail(
      pending.email,
      pending.organisationName,
      plainToken,
    );

    await this.auditService.logAuth(AuditAction.AUTH_EMAIL_VERIFICATION_SENT, {
      metadata: {
        email: pending.email,
        pendingRegistration: true,
      },
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return {
      message:
        'If a pending registration exists for this email, a new verification link has been sent.',
    };
  }

  async resendVerificationEmail(userId: string, context: AuthContext = {}) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isVerified) {
      return { message: 'Email is already verified', isVerified: true };
    }

    await this.sendVerificationEmail(user, context);

    return {
      message: 'Verification email sent',
      isVerified: false,
    };
  }

  getMfaStatus(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });
  }

  async enableMfaFoundation(userId: string) {
    const secret = randomUUID();
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false },
    });
    return {
      message: 'MFA secret generated. Complete verification to enable MFA.',
      mfaSecret: secret,
      qrCodeUrl: `otpauth://totp/EnterpriseProcurement:${userId}?secret=${secret}&issuer=EnterpriseProcurement`,
    };
  }

  private async completePendingRegistration(
    pending: {
      id: string;
      email: string;
      organisationName: string;
      slug: string;
      firstName: string;
      lastName: string;
      passwordHash: string;
      expiresAt: Date;
    },
    context: AuthContext,
  ) {
    if (pending.expiresAt < new Date()) {
      await this.pendingRegistrationRepository.delete(pending.id);
      throw new BadRequestException('Registration link has expired');
    }

    const existingOrganisation = await this.prisma.organisation.findUnique({
      where: { slug: pending.slug },
    });

    if (existingOrganisation) {
      await this.pendingRegistrationRepository.delete(pending.id);
      throw new ConflictException(
        'This organisation name is no longer available. Please register again with a different name.',
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    const result = await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: pending.organisationName,
          slug: pending.slug,
          trialEndsAt,
          billingEmail: pending.email,
        },
      });

      const user = await tx.user.create({
        data: {
          email: pending.email,
          firstName: pending.firstName,
          lastName: pending.lastName,
          passwordHash: pending.passwordHash,
          role: Role.ADMIN,
          organisationId: organisation.id,
          isVerified: true,
        },
      });

      await tx.notificationPreference.create({
        data: { userId: user.id },
      });

      await tx.pendingOrganisationRegistration.delete({
        where: { id: pending.id },
      });

      return { organisation, user };
    });

    const tokens = await this.createTokenPair(result.user);

    await this.auditService.logAuth(AuditAction.AUTH_EMAIL_VERIFIED, {
      userId: result.user.id,
      organisationId: result.organisation.id,
      metadata: { completedRegistration: true },
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });

    return {
      message: 'Email verified and organisation created successfully',
      isVerified: true,
      user: tokens.user,
      organisation: {
        id: result.organisation.id,
        name: result.organisation.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private assertWorkEmailAllowed(email: string) {
    const allowPersonalEmail =
      this.configService.get<string>('REGISTRATION_ALLOW_PERSONAL_EMAIL') ===
        'true' || process.env.NODE_ENV === 'test';

    assertWorkEmail(email, { allowPersonalEmail });
  }

  private async assertOrganisationSlugAvailable(
    slug: string,
    ignorePendingId?: string,
  ) {
    const existingOrganisation = await this.prisma.organisation.findUnique({
      where: { slug },
    });

    if (existingOrganisation) {
      throw new ConflictException('Organisation name is already taken');
    }

    const pendingRegistration =
      await this.pendingRegistrationRepository.findBySlug(slug);

    if (pendingRegistration && pendingRegistration.id !== ignorePendingId) {
      throw new ConflictException('Organisation name is already reserved');
    }
  }

  private buildPendingRegistrationExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + REGISTRATION_PENDING_EXPIRY_HOURS,
    );
    return expiresAt;
  }

  private async sendPendingRegistrationEmail(
    email: string,
    organisationName: string,
    rawToken: string,
  ) {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.jobService.enqueueEmail({
      to: email,
      templateKey: 'email_verification',
      variables: {
        verifyUrl,
        organisationName,
      },
    });
  }

  private async sendVerificationEmail(user: User, context: AuthContext = {}) {
    await this.authTokenRepository.invalidateUserTokens(
      user.id,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    const rawToken = createTokenId();
    const expiresAt = new Date(Date.now() + ms('24h'));

    await this.authTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      type: AuthTokenType.EMAIL_VERIFICATION,
      expiresAt,
    });

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.jobService.enqueueEmail({
      to: user.email,
      subject: 'Verify your SpendWise email',
      html: `<p>Verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    await this.auditService.logAuth(AuditAction.AUTH_EMAIL_VERIFICATION_SENT, {
      userId: user.id,
      organisationId: user.organisationId,
      ipAddress: context.ipAddress,
      correlationId: context.correlationId,
    });
  }

  private async handleFailedLogin(
    email: string,
    context: AuthContext,
    user?: User,
  ): Promise<void> {
    await this.auditService.recordLoginAttempt(
      email,
      false,
      context.ipAddress,
      context.userAgent,
    );

    await this.auditService.logAuth(AuditAction.AUTH_LOGIN_FAILED, {
      metadata: { email },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      correlationId: context.correlationId,
    });

    if (!user) return;

    const threshold = this.configService.get<number>(
      'ACCOUNT_LOCKOUT_THRESHOLD',
      5,
    );
    const lockMinutes = this.configService.get<number>(
      'ACCOUNT_LOCKOUT_DURATION_MINUTES',
      15,
    );

    const attempts = user.failedLoginAttempts + 1;

    if (attempts >= threshold) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: new Date(Date.now() + lockMinutes * 60 * 1000),
        },
      });

      await this.auditService.logAuth(AuditAction.AUTH_ACCOUNT_LOCKED, {
        userId: user.id,
        organisationId: user.organisationId,
        metadata: { attempts },
        ipAddress: context.ipAddress,
        correlationId: context.correlationId,
      });
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts },
    });
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        { secret: process.env.JWT_REFRESH_SECRET! },
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
      { ...payload, jti, familyId },
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
