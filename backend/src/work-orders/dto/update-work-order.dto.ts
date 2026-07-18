import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ example: 'Repair hydraulic pump - urgent' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ example: 'Inspection shows a worn seal.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'If false, the work order becomes ready to work.',
  })
  @IsBoolean()
  needSparepart: boolean;
}
