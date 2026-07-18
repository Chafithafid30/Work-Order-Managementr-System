import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SparepartItem } from '../common/entities/sparepart-item.entity';
import { SparepartRequest } from '../common/entities/sparepart-request.entity';
import { User } from '../common/entities/user.entity';
import { WorkOrder } from '../common/entities/work-order.entity';
import { SparepartRequestStatus } from '../common/enums/sparepart-request-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';
import { ActorService } from '../common/services/actor.service';
import { IdempotencyService } from '../common/services/idempotency.service';
import { AssignMechanicDto } from './dto/assign-mechanic.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { RequestSparepartDto } from './dto/request-sparepart.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import {
  WORK_ORDER_REPOSITORY,
  WorkOrderRepository,
} from './repositories/work-order.repository';
import { requireStatus } from './workflow-policy';

@Injectable()
/** Coordinates work-order use cases while persistence stays behind a repository. */
export class WorkOrdersService {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrders: WorkOrderRepository,
    private readonly actorService: ActorService,
    private readonly idempotency: IdempotencyService,
  ) {}

  findAll(): Promise<WorkOrder[]> {
    return this.workOrders.findAll();
  }

  async findOne(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrders.findById(id);
    if (!workOrder) throw new NotFoundException('Work order was not found');
    return workOrder;
  }

  create(
    actorId: string,
    key: string | undefined,
    dto: CreateWorkOrderDto,
  ): Promise<WorkOrder> {
    return this.idempotency.execute(
      'work-orders.create',
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, UserRole.ADMIN);
        return this.workOrders.save(
          manager,
          manager.create(WorkOrder, {
            title: dto.title.trim(),
            description: dto.description?.trim() || null,
            status: WorkOrderStatus.DRAFT,
            createdBy: actorId,
          }),
        );
      },
    );
  }

  submit(id: string, actorId: string, key?: string): Promise<WorkOrder> {
    return this.changeStatus(
      id,
      actorId,
      key,
      'work-orders.submit',
      UserRole.ADMIN,
      [WorkOrderStatus.DRAFT],
      WorkOrderStatus.SUBMITTED,
    );
  }

  assign(
    id: string,
    actorId: string,
    key: string | undefined,
    dto: AssignMechanicDto,
  ): Promise<WorkOrder> {
    return this.idempotency.execute(
      `work-orders.${id}.assign`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, UserRole.SPV);
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, WorkOrderStatus.SUBMITTED);
        const mechanic = await manager.findOne(User, {
          where: { id: dto.mechanicId },
        });
        if (!mechanic || mechanic.role !== UserRole.MECHANIC) {
          throw new ConflictException(
            'Selected user must have the MECHANIC role',
          );
        }
        workOrder.assignedMechanicId = mechanic.id;
        workOrder.status = WorkOrderStatus.ASSIGNED;
        return this.workOrders.save(manager, workOrder);
      },
    );
  }

  update(
    id: string,
    actorId: string,
    key: string | undefined,
    dto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    return this.idempotency.execute(
      `work-orders.${id}.update`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, UserRole.ADMIN);
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, WorkOrderStatus.ASSIGNED);
        if (dto.title) workOrder.title = dto.title.trim();
        if (dto.description !== undefined)
          workOrder.description = dto.description.trim() || null;
        // The sparepart decision is the only branch in the minimum workflow.
        // Keeping it explicit makes the state transition easy to audit.
        workOrder.status = dto.needSparepart
          ? WorkOrderStatus.UPDATED
          : WorkOrderStatus.READY_TO_WORK;
        return this.workOrders.save(manager, workOrder);
      },
    );
  }

  requestSparepart(
    id: string,
    actorId: string,
    key: string | undefined,
    dto: RequestSparepartDto,
  ): Promise<SparepartRequest> {
    return this.idempotency.execute(
      `work-orders.${id}.request-sparepart`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, UserRole.ADMIN);
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, WorkOrderStatus.UPDATED);
        const request = manager.create(SparepartRequest, {
          workOrderId: id,
          status: SparepartRequestStatus.PENDING,
          requestedBy: actorId,
          approvedBy: null,
        });
        const savedRequest = await manager.save(SparepartRequest, request);
        // Request, items, and work-order status share the transaction supplied
        // by IdempotencyService, so a partial sparepart request cannot persist.
        savedRequest.items = await manager.save(
          SparepartItem,
          dto.items.map((item) =>
            manager.create(SparepartItem, {
              sparepartRequestId: savedRequest.id,
              name: item.name.trim(),
              qty: item.qty,
            }),
          ),
        );
        workOrder.status = WorkOrderStatus.WAITING_SPAREPART_APPROVAL;
        await this.workOrders.save(manager, workOrder);
        return savedRequest;
      },
    );
  }

  start(id: string, actorId: string, key?: string): Promise<WorkOrder> {
    return this.idempotency.execute(
      `work-orders.${id}.start`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(
          manager,
          actorId,
          UserRole.MECHANIC,
        );
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, WorkOrderStatus.READY_TO_WORK);
        if (workOrder.assignedMechanicId !== actorId) {
          throw new ConflictException(
            'Only the assigned mechanic may start this work order',
          );
        }
        workOrder.status = WorkOrderStatus.WORKING;
        workOrder.startDate = new Date();
        return this.workOrders.save(manager, workOrder);
      },
    );
  }

  complete(
    id: string,
    actorId: string,
    key: string | undefined,
    dto: CompleteWorkOrderDto,
  ): Promise<WorkOrder> {
    return this.idempotency.execute(
      `work-orders.${id}.complete`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, UserRole.ADMIN);
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, WorkOrderStatus.WORKING);
        const endDate = new Date(dto.endDate);
        if (workOrder.startDate && endDate < workOrder.startDate) {
          throw new ConflictException(
            'End date cannot be earlier than start date',
          );
        }
        workOrder.endDate = endDate;
        workOrder.status = WorkOrderStatus.COMPLETED;
        return this.workOrders.save(manager, workOrder);
      },
    );
  }

  private changeStatus(
    id: string,
    actorId: string,
    key: string | undefined,
    operation: string,
    role: UserRole,
    allowedStatuses: WorkOrderStatus[],
    targetStatus: WorkOrderStatus,
  ): Promise<WorkOrder> {
    // Simple transitions use one helper; complex transitions remain explicit
    // in their own methods to preserve SRP without hiding business rules.
    return this.idempotency.execute(
      `${operation}.${id}`,
      key,
      actorId,
      async (manager) => {
        await this.actorService.requireRole(manager, actorId, role);
        const workOrder = await this.lockWorkOrder(manager, id);
        requireStatus(workOrder.status, ...allowedStatuses);
        workOrder.status = targetStatus;
        return this.workOrders.save(manager, workOrder);
      },
    );
  }

  private async lockWorkOrder(
    manager: EntityManager,
    id: string,
  ): Promise<WorkOrder> {
    // Every state-changing command locks before validating the current state.
    const workOrder = await this.workOrders.findByIdForUpdate(manager, id);
    if (!workOrder) throw new NotFoundException('Work order was not found');
    return workOrder;
  }
}
