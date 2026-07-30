import {
  ConflictException,
  Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { type StringValue } from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
    });

    const { passwordHash: _, ...result } = user;

    return result;
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

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload);

 const refreshToken = await this.jwtService.signAsync(payload, {
  secret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
});
  const { passwordHash, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
}
}