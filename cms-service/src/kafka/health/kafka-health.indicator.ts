import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { KafkaConfigService } from '../config/kafka-config.service';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class KafkaHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(KafkaHealthIndicator.name);
  private kafka: Kafka;
  private admin: Admin;

  constructor(private readonly kafkaConfigService: KafkaConfigService) {
    super();
    const config = this.kafkaConfigService.getHealthCheckConfig();
    this.kafka = new Kafka({
      clientId: 'health-check',
      brokers: config.brokers,
    });
    this.admin = this.kafka.admin();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.admin.connect();

      // Check if we can list topics (basic connectivity test)
      const topics = await this.admin.listTopics();

      // Check if our required topics exist
      const requiredTopics = ['products.events', 'customers.events', 'orders.events'];
      const missingTopics = requiredTopics.filter(topic => !topics.includes(topic));

      await this.admin.disconnect();

      if (missingTopics.length > 0) {
        throw new Error(`Missing required topics: ${missingTopics.join(', ')}`);
      }

      return this.getStatus(key, true, {
        topics: topics.length,
        requiredTopics: requiredTopics.length,
      });
    } catch (error) {
      this.logger.error('Kafka health check failed', error);
      throw new HealthCheckError(
        'Kafka health check failed',
        this.getStatus(key, false, {
          error: error.message,
        }),
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.admin.disconnect();
    } catch (error) {
      this.logger.error('Error disconnecting admin client', error);
    }
  }
}
