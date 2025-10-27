import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
import { CmsOrder } from '../database/entities/cms-order.entity';
import { ProcessedEvent } from '../database/entities/processed-event.entity';
import { DlqEvent } from '../database/entities/dlq-event.entity';
import { SyncService } from '../sync/sync.service';
import { KafkaConfigService } from './config/kafka-config.service';
import { DebeziumCdcTransformer } from './transformers/debezium-cdc.transformer';
import { CustomerEventHandler } from './handlers/customer-event.handler';
import { ProductEventHandler } from './handlers/product-event.handler';
import { OrderEventHandler } from './handlers/order-event.handler';
import { KafkaExceptionFilter } from './filters/kafka-exception.filter';
import { DlqService } from './services/dlq.service';
import { DlqAlertService, EmailAlertChannel, SlackAlertChannel, WebhookAlertChannel } from './services/dlq-alert.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CmsProduct,
      CmsCustomer,
      CmsOrder,
      ProcessedEvent,
      DlqEvent,
    ]),
  ],
  controllers: [
    // Event Handlers
    CustomerEventHandler,
    ProductEventHandler,
    OrderEventHandler,
  ],
  providers: [
    // Configuration
    KafkaConfigService,

    // Transformers
    DebeziumCdcTransformer,

    // Services
    SyncService,
    DlqService,
    DlqAlertService,

    // Alert Channels
    EmailAlertChannel,
    SlackAlertChannel,
    WebhookAlertChannel,

    // Exception Filter
    KafkaExceptionFilter,
  ],
  exports: [
    KafkaConfigService,
    DebeziumCdcTransformer,
    SyncService,
    DlqService,
    DlqAlertService,
  ],
})
export class KafkaModule {}
