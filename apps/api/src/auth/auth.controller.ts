import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt/jwt.guard';
import {
  loginRequestExample,
  loginResponseExample,
  logoutResponseExample,
  refreshTokenRequestExample,
  registerProcurementRequestExample,
  registerRequestExample,
  registerResponseExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CORRELATION_ID_HEADER } from '../common/constants/http.constants';
import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RegisterResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractContext(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId:
        (req as Request & { correlationId?: string }).correlationId ??
        (req.headers[CORRELATION_ID_HEADER] as string | undefined),
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new tenant' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      acmeCorp: {
        summary: 'Register Acme Corp',
        value: registerRequestExample,
      },
      globex: {
        summary: 'Register Globex Procurement',
        value: registerProcurementRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    schema: { example: registerResponseExample },
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, this.extractContext(req));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    type: LoginDto,
    examples: { default: { value: loginRequestExample } },
  })
  @ApiOkResponse({
    type: LoginResponseDto,
    schema: { example: loginResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.extractContext(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: { default: { value: refreshTokenRequestExample } },
  })
  @ApiOkResponse({
    type: LoginResponseDto,
    schema: { example: loginResponseExample },
  })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto, this.extractContext(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: { default: { value: refreshTokenRequestExample } },
  })
  @ApiOkResponse({
    type: LogoutResponseDto,
    schema: { example: logoutResponseExample },
  })
  logout(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.logout(dto, this.extractContext(req));
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all active sessions for current user' })
  revokeAll(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.authService.revokeAllSessions(
      user.sub,
      this.extractContext(req),
    );
  }

  @Get('mfa/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get MFA status (foundation)' })
  mfaStatus(@CurrentUser() user: JwtPayload) {
    return this.authService.getMfaStatus(user.sub);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generate MFA secret (foundation — verification not yet enforced)',
  })
  setupMfa(@CurrentUser() user: JwtPayload) {
    return this.authService.enableMfaFoundation(user.sub);
  }
}
