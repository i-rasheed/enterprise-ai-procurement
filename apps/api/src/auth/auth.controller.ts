import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  loginRequestExample,
  loginResponseExample,
  logoutResponseExample,
  refreshTokenRequestExample,
  registerProcurementRequestExample,
  registerRequestExample,
  registerResponseExample,
} from '../common/swagger/swagger-examples';
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new tenant',
    description:
      'Creates a new organisation and its first admin user. Returns organisationSlug for future logins.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Tenant registration payload',
    examples: {
      acmeCorp: {
        summary: 'Register Acme Corp',
        description: 'Creates tenant "Acme Corp" with slug acme-corp',
        value: registerRequestExample,
      },
      globex: {
        summary: 'Register Globex Procurement',
        description:
          'Creates tenant "Globex Procurement" with slug globex-procurement',
        value: registerProcurementRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Tenant and admin user created',
    type: RegisterResponseDto,
    schema: { example: registerResponseExample },
  })
  @ApiConflictResponse({ description: 'Organisation slug already exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login to a tenant',
    description:
      'Authenticates a user within a specific organisation tenant using organisationSlug.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Tenant-scoped login credentials',
    examples: {
      acmeAdmin: {
        summary: 'Login as Acme admin',
        description: 'Use organisationSlug from registration response',
        value: loginRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
    schema: { example: loginResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Rotates the refresh token and returns a new access/refresh token pair.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Valid refresh token from login or register',
    examples: {
      default: {
        summary: 'Refresh session',
        value: refreshTokenRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Tokens refreshed',
    type: LoginResponseDto,
    schema: { example: loginResponseExample },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or reused refresh token',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes the provided refresh token.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token to revoke',
    examples: {
      default: {
        summary: 'Logout current session',
        value: refreshTokenRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Logout successful',
    type: LogoutResponseDto,
    schema: { example: logoutResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}
