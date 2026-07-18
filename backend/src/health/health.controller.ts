import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @Public()
  async check() {
    await this.dataSource.query('SELECT 1');
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
