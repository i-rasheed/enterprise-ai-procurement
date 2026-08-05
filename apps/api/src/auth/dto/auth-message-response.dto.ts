import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  OrganisationSummaryDto,
  SafeUserResponseDto,
} from './auth-response.dto';

export class MessageAuthResponseDto {
  @ApiProperty({ example: 'If the email exists, a reset link has been sent.' })
  message: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({ example: 'Email verified successfully' })
  message: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiPropertyOptional({ type: SafeUserResponseDto })
  user?: SafeUserResponseDto;

  @ApiPropertyOptional({ type: OrganisationSummaryDto })
  organisation?: OrganisationSummaryDto;

  @ApiPropertyOptional({
    description: 'Present when organisation registration completes verification',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Present when organisation registration completes verification',
  })
  refreshToken?: string;
}
