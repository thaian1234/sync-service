import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
import { DlqStatus, DLQ_CONFIG } from '../enums';
import { DlqEventInputDto } from '../dto/domain-event.dto';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(
    @InjectRepository(DlqEvent)
    private dlqEventRepository: Repository<DlqEvent>,
  ) {}

  /**
   * Send event to Dead Letter Queue
   */
  async sendToDlq(input: DlqEventInputDto): Promise<DlqEvent> {
    const dlqEvent = this.dlqEventRepository.create({
      eventId: input.eventId,
      tableName: input.tableName,
      operation: input.operation,
      payload: input.payload,
      errorMessage: input.errorMessage,
      maxRetries: input.maxRetries ?? 5,
      retryCount: 0,
      status: DlqStatus.PENDING,
    });

    const saved = await this.dlqEventRepository.save(dlqEvent);

    this.logger.warn({
      message: 'Event sent to DLQ',
      eventId: input.eventId,
      tableName: input.tableName,
      operation: input.operation,
      error: input.errorMessage,
    });

    return saved;
  }

  /**
   * Send multiple events to DLQ in batch
   */
  async sendBatchToDlq(inputs: DlqEventInputDto[]): Promise<DlqEvent[]> {
    if (inputs.length === 0) return [];

    const dlqEvents = inputs.map((input) =>
      this.dlqEventRepository.create({
        eventId: input.eventId,
        tableName: input.tableName,
        operation: input.operation,
        payload: input.payload,
        errorMessage: input.errorMessage,
        maxRetries: input.maxRetries ?? 5,
        retryCount: 0,
        status: DlqStatus.PENDING,
      }),
    );

    const saved = await this.dlqEventRepository.save(dlqEvents);

    this.logger.warn({
      message: 'Batch events sent to DLQ',
      count: inputs.length,
      tables: [...new Set(inputs.map((i) => i.tableName))],
    });

    return saved;
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  calculateBackoffDelay(
    retryCount: number,
    baseDelayMs = DLQ_CONFIG.BASE_DELAY_MS,
    maxDelayMs = DLQ_CONFIG.MAX_DELAY_MS,
  ): number {
    const delay = Math.min(baseDelayMs * Math.pow(2, retryCount), maxDelayMs);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * DLQ_CONFIG.JITTER_FACTOR * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Check if event is ready for retry based on exponential backoff
   */
  isReadyForRetry(dlqEvent: DlqEvent): boolean {
    if (dlqEvent.status !== DlqStatus.PENDING) {
      return false;
    }

    if (dlqEvent.retryCount >= dlqEvent.maxRetries) {
      return false;
    }

    if (!dlqEvent.lastRetryAt) {
      return true; // Never retried, ready immediately
    }

    const backoffDelay = this.calculateBackoffDelay(dlqEvent.retryCount);
    const nextRetryTime = new Date(dlqEvent.lastRetryAt.getTime() + backoffDelay);

    return new Date() >= nextRetryTime;
  }

  /**
   * Get events ready for retry
   */
  async getEventsReadyForRetry(limit = DLQ_CONFIG.DEFAULT_FETCH_LIMIT): Promise<DlqEvent[]> {
    const pendingEvents = await this.dlqEventRepository.find({
      where: { status: DlqStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: limit * DLQ_CONFIG.FETCH_MULTIPLIER, // Fetch more since we'll filter by backoff
    });

    return pendingEvents.filter((event) => this.isReadyForRetry(event)).slice(0, limit);
  }

  /**
   * Mark event as retrying
   */
  async markAsRetrying(eventId: number): Promise<void> {
    await this.dlqEventRepository.update(eventId, {
      status: DlqStatus.RETRYING,
      lastRetryAt: new Date(),
    });
  }

  /**
   * Mark event as success
   */
  async markAsSuccess(eventId: number): Promise<void> {
    await this.dlqEventRepository.update(eventId, {
      status: DlqStatus.SUCCESS,
    });

    this.logger.log({
      message: 'DLQ event successfully processed',
      eventId,
    });
  }

  /**
   * Mark event as failed after max retries
   */
  async markAsFailed(eventId: number, errorMessage: string): Promise<void> {
    await this.dlqEventRepository.update(eventId, {
      status: DlqStatus.FAILED,
      errorMessage,
    });

    this.logger.error({
      message: 'DLQ event permanently failed after max retries',
      eventId,
      error: errorMessage,
    });
  }

  /**
   * Increment retry count and set back to pending
   */
  async incrementRetryCount(eventId: number, errorMessage: string): Promise<void> {
    const event = await this.dlqEventRepository.findOne({ where: { id: eventId } });

    if (!event) return;

    event.retryCount += 1;
    event.errorMessage = errorMessage;
    event.lastRetryAt = new Date();

    if (event.retryCount >= event.maxRetries) {
      event.status = DlqStatus.FAILED;
    } else {
      event.status = DlqStatus.PENDING;
    }

    await this.dlqEventRepository.save(event);
  }

  /**
   * Get DLQ statistics
   */
  async getStats() {
    const [pending, retrying, failed, success] = await Promise.all([
      this.dlqEventRepository.count({ where: { status: DlqStatus.PENDING } }),
      this.dlqEventRepository.count({ where: { status: DlqStatus.RETRYING } }),
      this.dlqEventRepository.count({ where: { status: DlqStatus.FAILED } }),
      this.dlqEventRepository.count({ where: { status: DlqStatus.SUCCESS } }),
    ]);

    return {
      pending,
      retrying,
      failed,
      success,
      total: pending + retrying + failed + success,
    };
  }
}
