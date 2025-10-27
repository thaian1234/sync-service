export interface BatchProcessorConfig {
    maxBatchSize: number;
    processorName: string;
}
export interface BatchMetrics {
    batchSize: number;
    processedCount: number;
    skippedCount: number;
    failedCount: number;
    processingTimeMs: number;
    throughput: number;
}
export declare class BatchProcessor<T> {
    private readonly config;
    private readonly logger;
    constructor(config: BatchProcessorConfig);
    processInChunks<R>(messages: T[], processor: (chunk: T[]) => Promise<R>): Promise<{
        results: R[];
        metrics: BatchMetrics;
    }>;
    private logMetrics;
}
