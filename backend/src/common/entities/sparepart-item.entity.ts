import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SparepartRequest } from './sparepart-request.entity';

@Entity('sparepart_items')
export class SparepartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sparepart_request_id', type: 'uuid' })
  sparepartRequestId: string;

  @ManyToOne(() => SparepartRequest, (request) => request.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sparepart_request_id' })
  sparepartRequest: SparepartRequest;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'integer' })
  qty: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
