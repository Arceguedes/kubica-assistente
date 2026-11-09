import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import type pg from 'pg';
import { PG_POOL } from '../database/database.module.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicador: HealthIndicatorService,
    @Inject(PG_POOL) private readonly pool: pg.Pool,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.indicador
          .check('postgres')
          .attempt(async () => {
            await this.pool.query('SELECT 1');
          })
          .withTimeout(3000),
    ]);
  }
}
