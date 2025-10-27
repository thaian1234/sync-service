import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DebeziumCdcTransformer } from '../transformers/debezium-cdc.transformer';
import { SyncService } from '../../sync/sync.service';
import { KafkaExceptionFilter } from '../filters/kafka-exception.filter';
import { DlqService } from '../services/dlq.service';
import { BaseEventHandler } from './base-event.handler';
import { KAFKA_TOPICS, CDC_TABLE_NAMES } from '../enums';

@Controller()
@UseFilters(KafkaExceptionFilter)
export class ProductEventHandler extends BaseEventHandler {
  constructor(
    cdcTransformer: DebeziumCdcTransformer,
    syncService: SyncService,
    dlqService: DlqService,
  ) {
    super(cdcTransformer, syncService, dlqService);
  }

  @EventPattern(KAFKA_TOPICS.PRODUCTS)
  async handleProductChanged(@Payload() message: any): Promise<void> {
    await this.processEvent(
      message,
      CDC_TABLE_NAMES.PRODUCTS,
      (event) => this.syncService.syncProductEvent(event),
    );
  }
}
