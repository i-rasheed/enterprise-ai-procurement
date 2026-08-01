import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class RejectGoodsItemDto {
  @ApiProperty({ example: 'clxgrnitem123' })
  @IsString()
  @IsNotEmpty()
  goodsReceiptItemId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantityRejected: number;

  @ApiProperty({
    example: 'Items damaged during transit. Packaging was compromised.',
  })
  @ValidateIf((item: RejectGoodsItemDto) => item.quantityRejected > 0)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  remarks: string;
}

export class RejectGoodsDto {
  @ApiProperty({ type: [RejectGoodsItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RejectGoodsItemDto)
  items: RejectGoodsItemDto[];
}
