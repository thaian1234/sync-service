import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { KafkaHealthIndicator } from '../kafka/health/kafka-health.indicator';
import { KafkaConfigService } from '../kafka/config/kafka-config.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [KafkaHealthIndicator, KafkaConfigService],
})
export class HealthModule {}
