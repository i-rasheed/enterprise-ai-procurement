import { ApiProperty } from '@nestjs/swagger';

import { SafeUserResponseDto } from '../../auth/dto/auth-response.dto';

export class OrganisationResponseDto {
  @ApiProperty({ example: 'clx789ghi' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  name: string;

  @ApiProperty({ example: 'acme-corp' })
  slug: string;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [SafeUserResponseDto] })
  users: SafeUserResponseDto[];
}
