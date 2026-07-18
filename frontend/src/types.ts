export type UserRole = 'ADMIN' | 'SPV' | 'MECHANIC';
export type WorkOrderStatus = 'DRAFT' | 'SUBMITTED' | 'ASSIGNED' | 'UPDATED' | 'WAITING_SPAREPART_APPROVAL' | 'READY_TO_WORK' | 'WORKING' | 'COMPLETED';

export interface User { id: string; name: string; email: string; role: UserRole }
export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
}
export interface SparepartItem { id: string; name: string; qty: number }
export interface SparepartRequest {
  id: string;
  status: 'PENDING' | 'APPROVED';
  approvalNote: string | null;
  items: SparepartItem[];
  requester?: User;
  approver?: User | null;
}
export interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: WorkOrderStatus;
  createdBy: string;
  assignedMechanicId: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  creator: User;
  assignedMechanic: User | null;
  sparepartRequests: SparepartRequest[];
}
