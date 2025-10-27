import { MetricsService } from '../services/metrics.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { DlqService } from '../services/dlq.service';
export declare class MetricsController {
    private readonly metricsService;
    private readonly circuitBreakerService;
    private readonly dlqService;
    constructor(metricsService: MetricsService, circuitBreakerService: CircuitBreakerService, dlqService: DlqService);
    getAllMetrics(): Record<string, any>;
    getTopicMetrics(topic: string, lastN?: number): import("../services/metrics.service").AggregatedMetrics;
    clearTopicMetrics(topic: string): {
        message: string;
    };
    clearAllMetrics(): {
        message: string;
    };
    getCircuitBreakers(): Record<string, any>;
    getCircuitBreaker(name: string): {
        state: import("../services/circuit-breaker.service").CircuitState;
        failureCount: number;
        successCount: number;
        nextAttemptTime: Date;
    };
    resetCircuitBreaker(name: string): {
        message: string;
    };
    resetAllCircuitBreakers(): {
        message: string;
    };
    getDlqStats(): Promise<{
        pending: number;
        retrying: number;
        failed: number;
        success: number;
        total: number;
    }>;
    getSummary(): Promise<{
        topics: Record<string, any>;
        circuitBreakers: Record<string, any>;
        dlq: {
            pending: number;
            retrying: number;
            failed: number;
            success: number;
            total: number;
        };
        timestamp: Date;
    }>;
}
