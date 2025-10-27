export interface EventMetrics {
    topic: string;
    partition: number;
    batchSize: number;
    processedCount: number;
    skippedCount: number;
    failedCount: number;
    processingTimeMs: number;
    throughput: number;
    timestamp: Date;
}
export interface AggregatedMetrics {
    totalProcessed: number;
    totalFailed: number;
    totalSkipped: number;
    averageBatchSize: number;
    averageProcessingTimeMs: number;
    averageThroughput: number;
    successRate: number;
}
export declare class MetricsService {
    private readonly logger;
    private metrics;
    private readonly MAX_METRICS_PER_TOPIC;
    recordBatchMetrics(metrics: EventMetrics): void;
    getTopicMetrics(topic: string, lastNBatches?: number): AggregatedMetrics;
    getAllTopicsMetrics(): Map<string, AggregatedMetrics>;
    clearTopicMetrics(topic: string): void;
    clearAllMetrics(): void;
}
