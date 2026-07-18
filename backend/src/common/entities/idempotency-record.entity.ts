import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('idempotency_records')
@Index(['operation', 'key', 'actorId'], { unique: true })
export class IdempotencyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  operation: string;

  @Column({ length: 100 })
  key: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ type: 'jsonb' })
  response: object;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
