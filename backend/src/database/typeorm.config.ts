import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IdempotencyRecord } from '../common/entities/idempotency-record.entity';
import { SparepartItem } from '../common/entities/sparepart-item.entity';
import { SparepartRequest } from '../common/entities/sparepart-request.entity';
import { User } from '../common/entities/user.entity';
import { WorkOrder } from '../common/entities/work-order.entity';

export const entities = [
  User,
  WorkOrder,
  SparepartRequest,
  SparepartItem,
  IdempotencyRecord,
];

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'work_order_user',
    password: process.env.POSTGRES_PASSWORD ?? 'work_order_password',
    database: process.env.POSTGRES_DB ?? 'work_order_db',
    entities,
    synchronize: false,
    migrationsRun: true,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    logging: process.env.NODE_ENV === 'development',
  };
}
