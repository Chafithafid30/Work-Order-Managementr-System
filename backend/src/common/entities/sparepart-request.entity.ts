import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SparepartRequestStatus } from '../enums/sparepart-request-status.enum';
import { SparepartItem } from './sparepart-item.entity';
import { User } from './user.entity';
import { WorkOrder } from './work-order.entity';

@Entity('sparepart_requests')
export class SparepartRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.sparepartRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @Column({
    type: 'enum',
    enum: SparepartRequestStatus,
    default: SparepartRequestStatus.PENDING,
  })
  status: SparepartRequestStatus;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @Column({ name: 'approval_note', type: 'text', nullable: true })
  approvalNote: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SparepartItem, (item) => item.sparepartRequest, {
    cascade: ['insert'],
  })
  items: SparepartItem[];
}
