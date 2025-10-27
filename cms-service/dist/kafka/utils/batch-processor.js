"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
const common_1 = require("@nestjs/common");
class BatchProcessor {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(config.processorName);
    }
    async processInChunks(messages, processor) {
        const startTime = Date.now();
        const results = [];
        let processedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        this.logger.debug(`Processing ${messages.length} messages in chunks of ${this.config.maxBatchSize}`);
        for (let i = 0; i < messages.length; i += this.config.maxBatchSize) {
            const chunk = messages.slice(i, i + this.config.maxBatchSize);
            try {
                const result = await processor(chunk);
                results.push(result);
                processedCount += chunk.length;
                this.logger.debug(`Processed chunk ${Math.floor(i / this.config.maxBatchSize) + 1}/${Math.ceil(messages.length / this.config.maxBatchSize)} (${chunk.length} messages)`);
            }
            catch (error) {
                failedCount += chunk.length;
                this.logger.error(`Failed to process chunk ${Math.floor(i / this.config.maxBatchSize) + 1}`, error.stack);
            }
        }
        const processingTimeMs = Date.now() - startTime;
        const throughput = processedCount / (processingTimeMs / 1000);
        const metrics = {
            batchSize: messages.length,
            processedCount,
            skippedCount,
            failedCount,
            processingTimeMs,
            throughput,
        };
        this.logMetrics(metrics);
        return { results, metrics };
    }
    logMetrics(metrics) {
        this.logger.log(Object.assign(Object.assign({ message: 'Batch processing completed' }, metrics), { successRate: `${((metrics.processedCount / metrics.batchSize) * 100).toFixed(2)}%` }));
    }
}
exports.BatchProcessor = BatchProcessor;
//# sourceMappingURL=batch-processor.js.map