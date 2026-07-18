import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Repair hydraulic pump' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Pressure drops during operation' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
