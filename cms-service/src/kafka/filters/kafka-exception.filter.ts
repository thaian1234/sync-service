import { Catch, ExceptionFilter, ArgumentsHost, Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
import { DlqStatus, ERROR_PATTERNS } from '../enums';

/**
 * Custom exception types for different error scenarios
 */
export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

@Catch()
@Injectable()
export class KafkaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(KafkaExceptionFilter.name);

  constructor(
    @InjectRepository(DlqEvent)
    private readonly dlqRepository: Repository<DlqEvent>,
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    // Extract event information
    const eventId = data?.eventId || 'unknown';
    const source = data?.source || 'unknown';
    const type = data?.type || 'unknown';

    this.logger.error(
      `Exception in Kafka event handler: ${exception.message}`,
      {
        eventId,
        source,
        type,
        error: exception.name,
        stack: exception.stack,
      },
    );

    // Determine if error is retryable
    const isRetryable = this.isRetryableError(exception);

    if (!isRetryable) {
      // Send to DLQ for non-retryable errors
      await this.sendToDlq(eventId, source, type, data, exception);
      this.logger.warn(`Event ${eventId} sent to DLQ due to non-retryable error`);

      // Don't throw - acknowledge the message to prevent infinite retries
      return;
    }

    // For retryable errors, throw to trigger Kafka consumer retry
    this.logger.warn(`Event ${eventId} will be retried due to retryable error`);
    throw exception;
  }

  /**
   * Determine if an error is retryable
   * Retryable: temporary network issues, database timeouts
   * Non-retryable: validation errors, business logic errors, data corruption
   */
  private isRetryableError(error: Error): boolean {
    // Explicitly marked errors
    if (error instanceof NonRetryableError) {
      return false;
    }
    if (error instanceof RetryableError) {
      return true;
    }

    const message = error.message;

    // Database connection errors are retryable
    const retryablePatterns = Object.values(ERROR_PATTERNS.RETRYABLE);
    if (retryablePatterns.some(pattern => message.includes(pattern))) {
      return true;
    }

    // Non-retryable patterns
    const nonRetryablePatterns = Object.values(ERROR_PATTERNS.NON_RETRYABLE);
    if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
      return false;
    }

    // Default to non-retryable for unknown errors to prevent infinite loops
    return false;
  }

  /**
   * Send failed event to Dead Letter Queue
   */
  private async sendToDlq(
    eventId: string,
    source: string,
    type: string,
    payload: any,
    error: Error,
  ): Promise<void> {
    try {
      const dlqEvent = new DlqEvent();
      dlqEvent.eventId = eventId;
      dlqEvent.tableName = source;
      dlqEvent.operation = type;
      dlqEvent.payload = payload;
      dlqEvent.errorMessage = error.message;
      dlqEvent.status = DlqStatus.PENDING;
      dlqEvent.retryCount = 0;

      await this.dlqRepository.save(dlqEvent);

      this.logger.log(`Successfully saved event ${eventId} to DLQ`);
    } catch (dlqError) {
      // If we can't save to DLQ, log the error but don't throw
      // This prevents losing the original error information
      this.logger.error(
        `Failed to save event ${eventId} to DLQ: ${dlqError.message}`,
        dlqError.stack,
      );
    }
  }
}
