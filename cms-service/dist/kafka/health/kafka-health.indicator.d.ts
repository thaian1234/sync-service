import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { KafkaConfigService } from '../config/kafka-config.service';
export declare class KafkaHealthIndicator extends HealthIndicator {
    private readonly kafkaConfigService;
    private readonly logger;
    private kafka;
    private admin;
    constructor(kafkaConfigService: KafkaConfigService);
    isHealthy(key: string): Promise<HealthIndicatorResult>;
    onModuleDestroy(): Promise<void>;
}
