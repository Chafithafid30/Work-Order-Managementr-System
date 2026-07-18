import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveSparepartRequestDto {
  @ApiPropertyOptional({ example: 'Approved for immediate purchase' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  approvalNote?: string;
}
