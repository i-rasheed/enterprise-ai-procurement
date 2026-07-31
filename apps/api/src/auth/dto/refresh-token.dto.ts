import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmMiLCJqdGkiOiIxMjM0NTY3ODkwIn0.example',
    description: 'Refresh token returned from login',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
