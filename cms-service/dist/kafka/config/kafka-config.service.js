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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const kafkajs_1 = require("kafkajs");
const enums_1 = require("../enums");
let KafkaConfigService = class KafkaConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    getKafkaMicroserviceOptions() {
        return {
            transport: microservices_1.Transport.KAFKA,
            options: {
                client: {
                    clientId: this.configService.get("KAFKA_CLIENT_ID", "cms-service"),
                    brokers: this.getBrokers(),
                    retry: {
                        initialRetryTime: enums_1.KAFKA_CONFIG.CLIENT.INITIAL_RETRY_TIME,
                        retries: enums_1.KAFKA_CONFIG.CLIENT.RETRIES,
                        maxRetryTime: enums_1.KAFKA_CONFIG.CLIENT.MAX_RETRY_TIME,
                    },
                    connectionTimeout: enums_1.KAFKA_CONFIG.CLIENT.CONNECTION_TIMEOUT,
                    requestTimeout: enums_1.KAFKA_CONFIG.CLIENT.REQUEST_TIMEOUT,
                },
                consumer: {
                    groupId: this.configService.get("KAFKA_CONSUMER_GROUP", "cms-service-group"),
                    sessionTimeout: enums_1.KAFKA_CONFIG.CONSUMER.SESSION_TIMEOUT,
                    heartbeatInterval: enums_1.KAFKA_CONFIG.CONSUMER.HEARTBEAT_INTERVAL,
                    allowAutoTopicCreation: false,
                },
                producer: {
                    createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner,
                    allowAutoTopicCreation: false,
                    retry: {
                        initialRetryTime: enums_1.KAFKA_CONFIG.PRODUCER.INITIAL_RETRY_TIME,
                        retries: enums_1.KAFKA_CONFIG.PRODUCER.RETRIES,
                        maxRetryTime: enums_1.KAFKA_CONFIG.PRODUCER.MAX_RETRY_TIME,
                    },
                },
                subscribe: {
                    fromBeginning: true,
                },
                run: {
                    autoCommit: true,
                    autoCommitInterval: enums_1.KAFKA_CONFIG.CONSUMER.AUTO_COMMIT_INTERVAL,
                    partitionsConsumedConcurrently: enums_1.KAFKA_CONFIG.CONSUMER.PARTITIONS_CONSUMED_CONCURRENTLY,
                },
            },
        };
    }
    getBrokers() {
        const brokerString = this.configService.get("KAFKA_BROKER", "kafka:9092");
        return brokerString.split(",").map((broker) => broker.trim());
    }
    getProducerConfig() {
        return {
            brokers: this.getBrokers(),
            clientId: `${this.configService.get("KAFKA_CLIENT_ID", "cms-service")}-producer`,
            retry: {
                initialRetryTime: enums_1.KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_INITIAL_RETRY_TIME,
                retries: enums_1.KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_RETRIES,
                maxRetryTime: enums_1.KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_MAX_RETRY_TIME,
            },
        };
    }
    getConsumerConfig(groupId) {
        return {
            brokers: this.getBrokers(),
            groupId: groupId ||
                this.configService.get("KAFKA_CONSUMER_GROUP", "cms-service-group"),
            sessionTimeout: enums_1.KAFKA_CONFIG.CONSUMER.HEALTH_CHECK_SESSION_TIMEOUT,
            heartbeatInterval: enums_1.KAFKA_CONFIG.CONSUMER.HEARTBEAT_INTERVAL,
            retry: {
                initialRetryTime: enums_1.KAFKA_CONFIG.HEALTH_CHECK.CONFIG_INITIAL_RETRY_TIME,
                retries: enums_1.KAFKA_CONFIG.HEALTH_CHECK.CONFIG_RETRIES,
                maxRetryTime: enums_1.KAFKA_CONFIG.HEALTH_CHECK.CONFIG_MAX_RETRY_TIME,
            },
        };
    }
    getHealthCheckConfig() {
        return {
            timeout: enums_1.KAFKA_CONFIG.HEALTH_CHECK.TIMEOUT,
            brokers: this.getBrokers(),
        };
    }
};
exports.KafkaConfigService = KafkaConfigService;
exports.KafkaConfigService = KafkaConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaConfigService);
//# sourceMappingURL=kafka-config.service.js.map