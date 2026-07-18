import { ConflictException } from '@nestjs/common';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';

export function requireStatus(
  actual: WorkOrderStatus,
  ...allowed: WorkOrderStatus[]
): void {
  // Keep transition validation in one policy instead of duplicating it across
  // controllers and use cases.
  if (!allowed.includes(actual)) {
    throw new ConflictException(
      `Action is not allowed when work order status is ${actual}`,
    );
  }
}
