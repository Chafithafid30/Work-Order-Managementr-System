import { ConflictException } from '@nestjs/common';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';
import { requireStatus } from './workflow-policy';

describe('workflow policy', () => {
  it('allows an action when the current status is accepted', () => {
    expect(() =>
      requireStatus(WorkOrderStatus.DRAFT, WorkOrderStatus.DRAFT),
    ).not.toThrow();
  });

  it('rejects an action when the current status is not accepted', () => {
    expect(() =>
      requireStatus(WorkOrderStatus.COMPLETED, WorkOrderStatus.DRAFT),
    ).toThrow(ConflictException);
  });
});
