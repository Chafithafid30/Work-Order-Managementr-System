import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SparepartRequest } from '../common/entities/sparepart-request.entity';
import { WorkOrder } from '../common/entities/work-order.entity';
import { SparepartRequestStatus } from '../common/enums/sparepart-request-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';
import { ActorService } from '../common/services/actor.service';
import { IdempotencyService } from '../common/services/idempotency.service';
import { requireStatus } from '../work-orders/workflow-policy';
import { ApproveSparepartRequestDto } from './dto/approve-sparepart-request.dto';

@Injectable()
export class SparepartRequestsService {
  constructor(
    private readonly actors: ActorService,
    private readonly idempotency: IdempotencyService,
  ) {}

  approve(
    id: string,
    actorId: string,
    key: string | undefined,
    dto: ApproveSparepartRequestDto,
  ): Promise<SparepartRequest> {
    // Approval changes two aggregates atomically: the request becomes approved
    // while its work order becomes ready for the assigned mechanic.
    return this.idempotency.execute(
      `sparepart-requests.${id}.approve`,
      key,
      actorId,
      async (manager) => {
        await this.actors.requireRole(manager, actorId, UserRole.SPV);
        const request = await this.lockRequest(manager, id);
        if (request.status !== SparepartRequestStatus.PENDING) {
          throw new NotFoundException(
            'Pending sparepart request was not found',
          );
        }
        const workOrder = await manager
          .getRepository(WorkOrder)
          .createQueryBuilder('workOrder')
          .setLock('pessimistic_write')
          .where('workOrder.id = :id', { id: request.workOrderId })
          .getOne();
        if (!workOrder)
          throw new NotFoundException('Related work order was not found');
        requireStatus(
          workOrder.status,
          WorkOrderStatus.WAITING_SPAREPART_APPROVAL,
        );
        request.status = SparepartRequestStatus.APPROVED;
        request.approvedBy = actorId;
        request.approvalNote = dto.approvalNote?.trim() || null;
        workOrder.status = WorkOrderStatus.READY_TO_WORK;
        await manager.save(WorkOrder, workOrder);
        return manager.save(SparepartRequest, request);
      },
    );
  }

  private async lockRequest(
    manager: EntityManager,
    id: string,
  ): Promise<SparepartRequest> {
    // Serialize approvals so a pending request can only be approved once.
    const request = await manager
      .getRepository(SparepartRequest)
      .createQueryBuilder('request')
      .setLock('pessimistic_write')
      .where('request.id = :id', { id })
      .getOne();
    if (!request)
      throw new NotFoundException('Sparepart request was not found');
    return request;
  }
}
