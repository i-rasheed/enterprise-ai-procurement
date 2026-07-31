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
      'Creates a new organisation and its first admin user. Email must be globally unique.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Tenant registration payload',
    examples: {
      acmeCorp: {
        summary: 'Register Acme Corp',
        description:
          'Creates tenant "Acme Corp" with the registering user as admin',
        value: registerRequestExample,
      },
      globex: {
        summary: 'Register Globex Procurement',
        description:
          'Creates tenant "Globex Procurement" with the registering user as admin',
        value: registerProcurementRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Tenant and admin user created',
    type: RegisterResponseDto,
    schema: { example: registerResponseExample },
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates a user with email and password. Organisation context comes from the user record.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials',
    examples: {
      acmeAdmin: {
        summary: 'Login as Acme admin',
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
