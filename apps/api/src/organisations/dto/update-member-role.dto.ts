import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

import { ASSIGNABLE_MEMBER_ROLES } from '../../common/constants/role.constants';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: ASSIGNABLE_MEMBER_ROLES,
    example: Role.USER,
  })
  @IsEnum(Role)
  role: Role;
}
