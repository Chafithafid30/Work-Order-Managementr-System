import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WorkOrder } from '../../common/entities/work-order.entity';
import { WorkOrderRepository } from './work-order.repository';

@Injectable()
export class TypeOrmWorkOrderRepository implements WorkOrderRepository {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly repository: Repository<WorkOrder>,
  ) {}

  findAll(): Promise<WorkOrder[]> {
    return this.repository.find({
      relations: {
        creator: true,
        assignedMechanic: true,
        sparepartRequests: { items: true, approver: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<WorkOrder | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        creator: true,
        assignedMechanic: true,
        sparepartRequests: { items: true, approver: true, requester: true },
      },
    });
  }

  findByIdForUpdate(
    manager: EntityManager,
    id: string,
  ): Promise<WorkOrder | null> {
    // Lock the latest row until the surrounding transaction completes. This
    // prevents two requests from passing the same status check concurrently.
    return manager
      .getRepository(WorkOrder)
      .createQueryBuilder('workOrder')
      .setLock('pessimistic_write')
      .where('workOrder.id = :id', { id })
      .getOne();
  }

  save(manager: EntityManager, workOrder: WorkOrder): Promise<WorkOrder> {
    return manager.save(WorkOrder, workOrder);
  }
}
