import {
  Body,
  Controller,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { normalizeIdempotencyKey } from '../common/http/request-headers';
import { ApproveSparepartRequestDto } from './dto/approve-sparepart-request.dto';
import { SparepartRequestsService } from './sparepart-requests.service';

@ApiTags('sparepart-requests')
@ApiBearerAuth()
@Controller('sparepart-requests')
export class SparepartRequestsController {
  constructor(private readonly service: SparepartRequestsService) {}

  @Post(':id/approve')
  @Roles(UserRole.SPV)
  @ApiHeader({ name: 'Idempotency-Key', required: false })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: ApproveSparepartRequestDto,
  ) {
    return this.service.approve(
      id,
      actor.id,
      normalizeIdempotencyKey(key),
      dto,
    );
  }
}
