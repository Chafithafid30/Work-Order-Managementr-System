import {
  Body,
  Controller,
  Get,
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
import { AssignMechanicDto } from './dto/assign-mechanic.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { RequestSparepartDto } from './dto/request-sparepart.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('work-orders')
@ApiBearerAuth()
@Controller('work-orders')
/** HTTP adapter: maps validated requests to use cases without business logic. */
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @IdempotencyHeader()
  create(
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.service.create(actor.id, normalizeIdempotencyKey(key), dto);
  }

  @Post(':id/submit')
  @Roles(UserRole.ADMIN)
  @IdempotencyHeader()
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key?: string,
  ) {
    return this.service.submit(id, actor.id, normalizeIdempotencyKey(key));
  }

  @Post(':id/assign')
  @Roles(UserRole.SPV)
  @IdempotencyHeader()
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: AssignMechanicDto,
  ) {
    return this.service.assign(id, actor.id, normalizeIdempotencyKey(key), dto);
  }

  @Post(':id/update')
  @Roles(UserRole.ADMIN)
  @IdempotencyHeader()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.service.update(id, actor.id, normalizeIdempotencyKey(key), dto);
  }

  @Post(':id/request-sparepart')
  @Roles(UserRole.ADMIN)
  @IdempotencyHeader()
  requestSparepart(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: RequestSparepartDto,
  ) {
    return this.service.requestSparepart(
      id,
      actor.id,
      normalizeIdempotencyKey(key),
      dto,
    );
  }

  @Post(':id/start')
  @Roles(UserRole.MECHANIC)
  @IdempotencyHeader()
  start(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key?: string,
  ) {
    return this.service.start(id, actor.id, normalizeIdempotencyKey(key));
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN)
  @IdempotencyHeader()
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() dto: CompleteWorkOrderDto,
  ) {
    return this.service.complete(
      id,
      actor.id,
      normalizeIdempotencyKey(key),
      dto,
    );
  }
}

function IdempotencyHeader(): MethodDecorator {
  return ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique retry key (recommended)',
  });
}
