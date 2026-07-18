import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { SparepartRequestsModule } from './sparepart-requests/sparepart-requests.module';
import { UsersModule } from './users/users.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { createTypeOrmOptions } from './database/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { validateEnvironment } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({ useFactory: createTypeOrmOptions }),
    AuthModule,
    UsersModule,
    WorkOrdersModule,
    SparepartRequestsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
