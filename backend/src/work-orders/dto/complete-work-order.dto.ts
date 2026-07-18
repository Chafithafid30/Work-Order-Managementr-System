import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CompleteWorkOrderDto {
  @ApiProperty({ example: '2026-07-17T10:30:00.000Z' })
  @IsDateString()
  endDate: string;
}
