import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReceiveGoodsItemDto {
  @ApiProperty({ example: 'clxgrnitem123' })
  @IsString()
  @IsNotEmpty()
  goodsReceiptItemId: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantityReceived: number;
}

export class ReceiveGoodsDto {
  @ApiProperty({ type: [ReceiveGoodsItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveGoodsItemDto)
  items: ReceiveGoodsItemDto[];
}
