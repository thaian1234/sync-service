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
var KafkaHealthIndicator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const kafka_config_service_1 = require("../config/kafka-config.service");
const kafkajs_1 = require("kafkajs");
let KafkaHealthIndicator = KafkaHealthIndicator_1 = class KafkaHealthIndicator extends terminus_1.HealthIndicator {
    constructor(kafkaConfigService) {
        super();
        this.kafkaConfigService = kafkaConfigService;
        this.logger = new common_1.Logger(KafkaHealthIndicator_1.name);
        const config = this.kafkaConfigService.getHealthCheckConfig();
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'health-check',
            brokers: config.brokers,
        });
        this.admin = this.kafka.admin();
    }
    async isHealthy(key) {
        try {
            await this.admin.connect();
            const topics = await this.admin.listTopics();
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
        }
        catch (error) {
            this.logger.error('Kafka health check failed', error);
            throw new terminus_1.HealthCheckError('Kafka health check failed', this.getStatus(key, false, {
                error: error.message,
            }));
        }
    }
    async onModuleDestroy() {
        try {
            await this.admin.disconnect();
        }
        catch (error) {
            this.logger.error('Error disconnecting admin client', error);
        }
    }
};
exports.KafkaHealthIndicator = KafkaHealthIndicator;
exports.KafkaHealthIndicator = KafkaHealthIndicator = KafkaHealthIndicator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_config_service_1.KafkaConfigService])
], KafkaHealthIndicator);
//# sourceMappingURL=kafka-health.indicator.js.map