import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KafkaOptions, Transport } from "@nestjs/microservices";
import { Partitioners } from "kafkajs";
import { KAFKA_CONFIG, KAFKA_TOPICS } from "../enums";

@Injectable()
export class KafkaConfigService {
	constructor(private readonly configService: ConfigService) {}

	getKafkaMicroserviceOptions(): KafkaOptions {
		return {
			transport: Transport.KAFKA,
			options: {
				client: {
					clientId: this.configService.get<string>(
						"KAFKA_CLIENT_ID",
						"cms-service"
					),
					brokers: this.getBrokers(),
					retry: {
						initialRetryTime:
							KAFKA_CONFIG.CLIENT.INITIAL_RETRY_TIME,
						retries: KAFKA_CONFIG.CLIENT.RETRIES,
						maxRetryTime: KAFKA_CONFIG.CLIENT.MAX_RETRY_TIME,
					},
					connectionTimeout: KAFKA_CONFIG.CLIENT.CONNECTION_TIMEOUT,
					requestTimeout: KAFKA_CONFIG.CLIENT.REQUEST_TIMEOUT,
				},
				consumer: {
					groupId: this.configService.get<string>(
						"KAFKA_CONSUMER_GROUP",
						"cms-service-group"
					),
					sessionTimeout: KAFKA_CONFIG.CONSUMER.SESSION_TIMEOUT,
					heartbeatInterval: KAFKA_CONFIG.CONSUMER.HEARTBEAT_INTERVAL,
					allowAutoTopicCreation: false,
				},
				producer: {
					createPartitioner: Partitioners.DefaultPartitioner,
					allowAutoTopicCreation: false,
					retry: {
						initialRetryTime:
							KAFKA_CONFIG.PRODUCER.INITIAL_RETRY_TIME,
						retries: KAFKA_CONFIG.PRODUCER.RETRIES,
						maxRetryTime: KAFKA_CONFIG.PRODUCER.MAX_RETRY_TIME,
					},
				},
				subscribe: {
					fromBeginning: true,
				},
				run: {
					autoCommit: true,
					autoCommitInterval:
						KAFKA_CONFIG.CONSUMER.AUTO_COMMIT_INTERVAL,
					partitionsConsumedConcurrently:
						KAFKA_CONFIG.CONSUMER.PARTITIONS_CONSUMED_CONCURRENTLY,
				},
			},
		};
	}

	private getBrokers(): string[] {
		const brokerString = this.configService.get<string>(
			"KAFKA_BROKER",
			"kafka:9092"
		);
		return brokerString.split(",").map((broker) => broker.trim());
	}

	getProducerConfig() {
		return {
			brokers: this.getBrokers(),
			clientId: `${this.configService.get<string>(
				"KAFKA_CLIENT_ID",
				"cms-service"
			)}-producer`,
			retry: {
				initialRetryTime:
					KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_INITIAL_RETRY_TIME,
				retries: KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_RETRIES,
				maxRetryTime: KAFKA_CONFIG.PRODUCER.HEALTH_CHECK_MAX_RETRY_TIME,
			},
		};
	}

	getConsumerConfig(groupId?: string) {
		return {
			brokers: this.getBrokers(),
			groupId:
				groupId ||
				this.configService.get<string>(
					"KAFKA_CONSUMER_GROUP",
					"cms-service-group"
				),
			sessionTimeout: KAFKA_CONFIG.CONSUMER.HEALTH_CHECK_SESSION_TIMEOUT,
			heartbeatInterval: KAFKA_CONFIG.CONSUMER.HEARTBEAT_INTERVAL,
			retry: {
				initialRetryTime:
					KAFKA_CONFIG.HEALTH_CHECK.CONFIG_INITIAL_RETRY_TIME,
				retries: KAFKA_CONFIG.HEALTH_CHECK.CONFIG_RETRIES,
				maxRetryTime: KAFKA_CONFIG.HEALTH_CHECK.CONFIG_MAX_RETRY_TIME,
			},
		};
	}

	// Configuration for health checks
	getHealthCheckConfig() {
		return {
			timeout: KAFKA_CONFIG.HEALTH_CHECK.TIMEOUT,
			brokers: this.getBrokers(),
		};
	}
}
