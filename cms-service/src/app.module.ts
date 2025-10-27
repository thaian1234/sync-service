import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "./database/database.module";
import { KafkaModule } from "./kafka/kafka.module";
import { HealthModule } from "./health/health.module";
import { ProductsModule } from "./products/products.module";
import { CustomersModule } from "./customers/customers.module";
import { OrdersModule } from "./orders/orders.module";
import { DlqController } from "./dlq/dlq.controller";
import { SyncModule } from "./sync/sync.module";
import { RedisCacheModule } from "./cache/redis-cache.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		RedisCacheModule, // Redis cache for event idempotency
		DatabaseModule,
		KafkaModule,
		HealthModule,
		ProductsModule,
		CustomersModule,
		OrdersModule,
		SyncModule,
	],
	controllers: [DlqController],
})
export class AppModule {}
