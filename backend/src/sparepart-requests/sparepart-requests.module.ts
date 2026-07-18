import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SparepartRequestsController } from './sparepart-requests.controller';
import { SparepartRequestsService } from './sparepart-requests.service';

@Module({
  imports: [CommonModule],
  controllers: [SparepartRequestsController],
  providers: [SparepartRequestsService],
})
export class SparepartRequestsModule {}
