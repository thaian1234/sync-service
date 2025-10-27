import { Logger } from '@nestjs/common';
import { DebeziumCdcTransformer } from '../transformers/debezium-cdc.transformer';
import { SyncService } from '../../sync/sync.service';
import { DlqService } from '../services/dlq.service';
import { DLQ_CONFIG, ERROR_MESSAGES } from '../enums';

/**
 * Base class for event handlers
 * Provides common logic for handling Kafka events
 */
export abstract class BaseEventHandler {
  protected readonly logger: Logger;

  constructor(
    protected readonly cdcTransformer: DebeziumCdcTransformer,
    protected readonly syncService: SyncService,
    protected readonly dlqService: DlqService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Handle event processing with common error handling
   */
  protected async processEvent(
    message: any,
    tableName: string,
    syncHandler: (event: any) => Promise<void>,
  ): Promise<void> {
    try {
      // Validate CDC event structure
      if (!this.cdcTransformer.validateCdcEvent(message)) {
        this.logger.error(ERROR_MESSAGES.INVALID_CDC_EVENT_STRUCTURE, { message });
        await this.dlqService.sendToDlq({
          eventId: message.id,
          tableName,
          operation: 'unknown',
          payload: message,
          errorMessage: ERROR_MESSAGES.INVALID_CDC_EVENT_STRUCTURE,
          maxRetries: DLQ_CONFIG.DEFAULT_MAX_RETRIES,
        });
        return;
      }

      // Transform Debezium CDC event to domain event
      const domainEvent = this.cdcTransformer.transform(message);

      // Process event
      await syncHandler(domainEvent);
    } catch (error) {
      this.logger.error(`Failed to process event for table ${tableName}`, error.stack);

      // Send to DLQ
      await this.dlqService.sendToDlq({
        eventId: message.eventId || message.id,
        tableName,
        operation: message.__op || 'unknown',
        payload: message,
        errorMessage: error.message,
        maxRetries: DLQ_CONFIG.DEFAULT_MAX_RETRIES,
      });
    }
  }
}
