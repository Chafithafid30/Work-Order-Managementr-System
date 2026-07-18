import type { WorkOrderStatus } from '../types';

const labels: Record<WorkOrderStatus, string> = {
  DRAFT: 'Draft', SUBMITTED: 'Submitted', ASSIGNED: 'Assigned', UPDATED: 'Updated',
  WAITING_SPAREPART_APPROVAL: 'Awaiting approval', READY_TO_WORK: 'Ready to work',
  WORKING: 'Working', COMPLETED: 'Completed',
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return <span className={`status status--${status.toLowerCase()}`}>{labels[status]}</span>;
}

