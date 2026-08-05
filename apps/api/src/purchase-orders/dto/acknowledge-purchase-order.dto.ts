import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AcknowledgePurchaseOrderDto {
  @ApiPropertyOptional({
    example: 'Purchase order acknowledged. Delivery scheduled for November.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
