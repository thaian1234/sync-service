import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
import { DlqEventInputDto } from '../dto/domain-event.dto';
export declare class DlqService {
    private dlqEventRepository;
    private readonly logger;
    constructor(dlqEventRepository: Repository<DlqEvent>);
    sendToDlq(input: DlqEventInputDto): Promise<DlqEvent>;
    sendBatchToDlq(inputs: DlqEventInputDto[]): Promise<DlqEvent[]>;
    calculateBackoffDelay(retryCount: number, baseDelayMs?: 1000, maxDelayMs?: 300000): number;
    isReadyForRetry(dlqEvent: DlqEvent): boolean;
    getEventsReadyForRetry(limit?: 100): Promise<DlqEvent[]>;
    markAsRetrying(eventId: number): Promise<void>;
    markAsSuccess(eventId: number): Promise<void>;
    markAsFailed(eventId: number, errorMessage: string): Promise<void>;
    incrementRetryCount(eventId: number, errorMessage: string): Promise<void>;
    getStats(): Promise<{
        pending: number;
        retrying: number;
        failed: number;
        success: number;
        total: number;
    }>;
}
