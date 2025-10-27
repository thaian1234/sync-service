"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const metrics_service_1 = require("../services/metrics.service");
const circuit_breaker_service_1 = require("../services/circuit-breaker.service");
const dlq_service_1 = require("../services/dlq.service");
let MetricsController = class MetricsController {
    constructor(metricsService, circuitBreakerService, dlqService) {
        this.metricsService = metricsService;
        this.circuitBreakerService = circuitBreakerService;
        this.dlqService = dlqService;
    }
    getAllMetrics() {
        const topicsMetrics = this.metricsService.getAllTopicsMetrics();
        const result = {};
        for (const [topic, metrics] of topicsMetrics.entries()) {
            result[topic] = metrics;
        }
        return result;
    }
    getTopicMetrics(topic, lastN) {
        return this.metricsService.getTopicMetrics(topic, lastN);
    }
    clearTopicMetrics(topic) {
        this.metricsService.clearTopicMetrics(topic);
        return { message: `Metrics cleared for topic: ${topic}` };
    }
    clearAllMetrics() {
        this.metricsService.clearAllMetrics();
        return { message: 'All metrics cleared' };
    }
    getCircuitBreakers() {
        return this.circuitBreakerService.getAllStats();
    }
    getCircuitBreaker(name) {
        return this.circuitBreakerService.getStats(name);
    }
    resetCircuitBreaker(name) {
        this.circuitBreakerService.reset(name);
        return { message: `Circuit breaker '${name}' has been reset` };
    }
    resetAllCircuitBreakers() {
        this.circuitBreakerService.resetAll();
        return { message: 'All circuit breakers have been reset' };
    }
    async getDlqStats() {
        return this.dlqService.getStats();
    }
    async getSummary() {
        const [topicsMetrics, circuitBreakers, dlqStats] = await Promise.all([
            Promise.resolve(this.metricsService.getAllTopicsMetrics()),
            Promise.resolve(this.circuitBreakerService.getAllStats()),
            this.dlqService.getStats(),
        ]);
        const topics = {};
        for (const [topic, metrics] of topicsMetrics.entries()) {
            topics[topic] = metrics;
        }
        return {
            topics,
            circuitBreakers,
            dlq: dlqStats,
            timestamp: new Date(),
        };
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated metrics for all topics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getAllMetrics", null);
__decorate([
    (0, common_1.Get)('topic/:topic'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metrics for a specific topic' }),
    (0, swagger_1.ApiParam)({ name: 'topic', description: 'Kafka topic name' }),
    (0, swagger_1.ApiQuery)({ name: 'lastN', required: false, description: 'Last N batches to analyze' }),
    __param(0, (0, common_1.Param)('topic')),
    __param(1, (0, common_1.Query)('lastN')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getTopicMetrics", null);
__decorate([
    (0, common_1.Delete)('topic/:topic'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear metrics for a specific topic' }),
    (0, swagger_1.ApiParam)({ name: 'topic', description: 'Kafka topic name' }),
    __param(0, (0, common_1.Param)('topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "clearTopicMetrics", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "clearAllMetrics", null);
__decorate([
    (0, common_1.Get)('circuit-breakers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get status of all circuit breakers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getCircuitBreakers", null);
__decorate([
    (0, common_1.Get)('circuit-breakers/:name'),
    (0, swagger_1.ApiOperation)({ summary: 'Get status of a specific circuit breaker' }),
    (0, swagger_1.ApiParam)({ name: 'name', description: 'Circuit breaker name' }),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getCircuitBreaker", null);
__decorate([
    (0, common_1.Delete)('circuit-breakers/:name'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset a specific circuit breaker' }),
    (0, swagger_1.ApiParam)({ name: 'name', description: 'Circuit breaker name' }),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "resetCircuitBreaker", null);
__decorate([
    (0, common_1.Delete)('circuit-breakers'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset all circuit breakers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "resetAllCircuitBreakers", null);
__decorate([
    (0, common_1.Get)('dlq/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get DLQ statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getDlqStats", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall system metrics summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getSummary", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('metrics'),
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService,
        circuit_breaker_service_1.CircuitBreakerService,
        dlq_service_1.DlqService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map