import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { KafkaHealthIndicator } from '../kafka/health/kafka-health.indicator';
export declare class HealthController {
    private health;
    private db;
    private kafka;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, kafka: KafkaHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    checkDatabase(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    checkKafka(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
