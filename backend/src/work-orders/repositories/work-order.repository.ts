import { EntityManager } from 'typeorm';
import { WorkOrder } from '../../common/entities/work-order.entity';

export const WORK_ORDER_REPOSITORY = Symbol('WORK_ORDER_REPOSITORY');

/**
 * Persistence boundary used by the use-case layer. Depending on this small
 * contract keeps WorkOrdersService independent from TypeORM (SOLID: DIP/ISP).
 */
export interface WorkOrderRepository {
  findAll(): Promise<WorkOrder[]>;
  findById(id: string): Promise<WorkOrder | null>;
  findByIdForUpdate(
    manager: EntityManager,
    id: string,
  ): Promise<WorkOrder | null>;
  save(manager: EntityManager, workOrder: WorkOrder): Promise<WorkOrder>;
}
