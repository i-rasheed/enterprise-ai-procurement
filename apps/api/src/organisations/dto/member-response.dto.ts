import { ApiProperty } from '@nestjs/swagger';

import { SafeUserResponseDto } from '../../auth/dto/auth-response.dto';

export class InviteMemberResponseDto {
  @ApiProperty({ type: SafeUserResponseDto })
  user: SafeUserResponseDto;
}

export class MemberListResponseDto {
  @ApiProperty({ type: [SafeUserResponseDto] })
  members: SafeUserResponseDto[];
}
