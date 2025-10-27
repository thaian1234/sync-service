"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = MetricsService_1 = class MetricsService {
    constructor() {
        this.logger = new common_1.Logger(MetricsService_1.name);
        this.metrics = new Map();
        this.MAX_METRICS_PER_TOPIC = 1000;
    }
    recordBatchMetrics(metrics) {
        const topicMetrics = this.metrics.get(metrics.topic) || [];
        topicMetrics.push(metrics);
        if (topicMetrics.length > this.MAX_METRICS_PER_TOPIC) {
            topicMetrics.shift();
        }
        this.metrics.set(metrics.topic, topicMetrics);
        this.logger.debug({
            message: 'Batch metrics recorded',
            topic: metrics.topic,
            partition: metrics.partition,
            batchSize: metrics.batchSize,
            processedCount: metrics.processedCount,
            failedCount: metrics.failedCount,
            throughput: `${metrics.throughput.toFixed(2)} msg/s`,
            successRate: `${((metrics.processedCount / metrics.batchSize) * 100).toFixed(2)}%`,
        });
    }
    getTopicMetrics(topic, lastNBatches) {
        const topicMetrics = this.metrics.get(topic) || [];
        const metricsToAnalyze = lastNBatches
            ? topicMetrics.slice(-lastNBatches)
            : topicMetrics;
        if (metricsToAnalyze.length === 0) {
            return {
                totalProcessed: 0,
                totalFailed: 0,
                totalSkipped: 0,
                averageBatchSize: 0,
                averageProcessingTimeMs: 0,
                averageThroughput: 0,
                successRate: 0,
            };
        }
        const totalProcessed = metricsToAnalyze.reduce((sum, m) => sum + m.processedCount, 0);
        const totalFailed = metricsToAnalyze.reduce((sum, m) => sum + m.failedCount, 0);
        const totalSkipped = metricsToAnalyze.reduce((sum, m) => sum + m.skippedCount, 0);
        const totalMessages = totalProcessed + totalFailed + totalSkipped;
        return {
            totalProcessed,
            totalFailed,
            totalSkipped,
            averageBatchSize: metricsToAnalyze.reduce((sum, m) => sum + m.batchSize, 0) /
                metricsToAnalyze.length,
            averageProcessingTimeMs: metricsToAnalyze.reduce((sum, m) => sum + m.processingTimeMs, 0) /
                metricsToAnalyze.length,
            averageThroughput: metricsToAnalyze.reduce((sum, m) => sum + m.throughput, 0) /
                metricsToAnalyze.length,
            successRate: totalMessages > 0 ? (totalProcessed / totalMessages) * 100 : 0,
        };
    }
    getAllTopicsMetrics() {
        const result = new Map();
        for (const topic of this.metrics.keys()) {
            result.set(topic, this.getTopicMetrics(topic));
        }
        return result;
    }
    clearTopicMetrics(topic) {
        this.metrics.delete(topic);
        this.logger.log(`Cleared metrics for topic: ${topic}`);
    }
    clearAllMetrics() {
        this.metrics.clear();
        this.logger.log('Cleared all metrics');
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map