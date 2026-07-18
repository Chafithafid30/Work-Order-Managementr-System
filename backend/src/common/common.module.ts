import { Module } from '@nestjs/common';
import { ActorService } from './services/actor.service';
import { IdempotencyService } from './services/idempotency.service';

@Module({
  providers: [ActorService, IdempotencyService],
  exports: [ActorService, IdempotencyService],
})
export class CommonModule {}
