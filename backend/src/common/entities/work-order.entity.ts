import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { WorkOrderStatus } from '../enums/work-order-status.enum';
import { SparepartRequest } from './sparepart-request.entity';
import { User } from './user.entity';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.DRAFT,
  })
  status: WorkOrderStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, (user) => user.createdWorkOrders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'assigned_mechanic_id', type: 'uuid', nullable: true })
  assignedMechanicId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assigned_mechanic_id' })
  assignedMechanic: User | null;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => SparepartRequest, (request) => request.workOrder)
  sparepartRequests: SparepartRequest[];
}
