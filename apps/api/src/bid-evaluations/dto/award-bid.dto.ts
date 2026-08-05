import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AwardBidDto {
  @ApiProperty({ example: 'clxbid123' })
  @IsString()
  @IsNotEmpty()
  bidId: string;

  @ApiProperty({
    example:
      'Best overall score with competitive pricing and verified compliance.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  awardReason: string;
}
