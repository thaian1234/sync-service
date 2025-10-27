import { ConfigService } from "@nestjs/config";
import { KafkaOptions } from "@nestjs/microservices";
export declare class KafkaConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    getKafkaMicroserviceOptions(): KafkaOptions;
    private getBrokers;
    getProducerConfig(): {
        brokers: string[];
        clientId: string;
        retry: {
            initialRetryTime: 300;
            retries: 5;
            maxRetryTime: 30000;
        };
    };
    getConsumerConfig(groupId?: string): {
        brokers: string[];
        groupId: string;
        sessionTimeout: 60000;
        heartbeatInterval: 3000;
        retry: {
            initialRetryTime: 300;
            retries: 5;
            maxRetryTime: 30000;
        };
    };
    getHealthCheckConfig(): {
        timeout: 5000;
        brokers: string[];
    };
}
