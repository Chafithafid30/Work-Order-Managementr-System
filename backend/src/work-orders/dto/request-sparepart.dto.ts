import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SparepartItemDto {
  @ApiProperty({ example: 'Hydraulic seal' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  qty: number;
}

export class RequestSparepartDto {
  @ApiProperty({ type: [SparepartItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SparepartItemDto)
  items: SparepartItemDto[];
}
