import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../common/entities/work-order.entity';
import { CommonModule } from '../common/common.module';
import { WORK_ORDER_REPOSITORY } from './repositories/work-order.repository';
import { TypeOrmWorkOrderRepository } from './repositories/typeorm-work-order.repository';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder]), CommonModule],
  controllers: [WorkOrdersController],
  providers: [
    WorkOrdersService,
    { provide: WORK_ORDER_REPOSITORY, useClass: TypeOrmWorkOrderRepository },
  ],
})
export class WorkOrdersModule {}
