import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignMechanicDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  mechanicId: string;
}
