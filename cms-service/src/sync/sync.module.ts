import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CmsProduct } from "../database/entities/cms-product.entity";
import { CmsCustomer } from "../database/entities/cms-customer.entity";
import { CmsOrder } from "../database/entities/cms-order.entity";
import { ProcessedEvent } from "../database/entities/processed-event.entity";
import { DlqEvent } from "../database/entities/dlq-event.entity";
import { SyncService } from "./sync.service";
import { RetryService } from "./retry.service";
import { DebeziumCdcTransformer } from "../kafka/transformers/debezium-cdc.transformer";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			CmsProduct,
			CmsCustomer,
			CmsOrder,
			ProcessedEvent,
			DlqEvent,
		]),
		KafkaModule, // Import KafkaModule to access DlqService
	],
	providers: [SyncService, RetryService, DebeziumCdcTransformer],
	exports: [SyncService, RetryService],
})
export class SyncModule {}
