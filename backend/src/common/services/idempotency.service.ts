import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { IdempotencyRecord } from '../entities/idempotency-record.entity';

@Injectable()
export class IdempotencyService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Runs one business command and stores its response in the same transaction.
   * The operation, key, and actor form the retry scope so unrelated commands
   * can safely use their own idempotency keys.
   */
  async execute<T extends object>(
    operation: string,
    key: string | undefined,
    actorId: string,
    action: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    // A missing key disables replay protection, but the command remains atomic.
    if (!key) return this.dataSource.transaction(action);

    // This fast path avoids starting a transaction for ordinary network retries.
    const existing = await this.findRecord<T>(operation, key, actorId);
    if (existing) return existing;

    try {
      return await this.dataSource.transaction(async (manager) => {
        // Reserve the unique key before executing the command. PostgreSQL makes
        // concurrent requests wait here, preventing both from mutating data.
        await manager.insert(IdempotencyRecord, {
          operation,
          key,
          actorId,
          response: {},
        });
        const response = await action(manager);
        await manager.update(
          IdempotencyRecord,
          { operation, key, actorId },
          { response },
        );
        return response;
      });
    } catch (error) {
      if (!this.isUniqueViolation(error)) throw error;
      // A concurrent request committed first; replay its final response.
      const replayedResponse = await this.findRecord<T>(
        operation,
        key,
        actorId,
      );
      if (replayedResponse) return replayedResponse;
      throw error;
    }
  }

  private async findRecord<T extends object>(
    operation: string,
    key: string,
    actorId: string,
  ): Promise<T | null> {
    const record = await this.dataSource
      .getRepository(IdempotencyRecord)
      .findOne({
        where: { operation, key, actorId },
      });
    return record ? (record.response as T) : null;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    );
  }
}
