import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { KafkaHealthIndicator } from '../kafka/health/kafka-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private kafka: KafkaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.kafka.isHealthy('kafka'),
    ]);
  }

  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('kafka')
  @HealthCheck()
  checkKafka() {
    return this.health.check([
      () => this.kafka.isHealthy('kafka'),
    ]);
  }
}
