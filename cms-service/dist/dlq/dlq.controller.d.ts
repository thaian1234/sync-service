import { RetryService } from '../sync/retry.service';
import { DlqService } from '../kafka/services/dlq.service';
import { DlqAlertService } from '../kafka/services/dlq-alert.service';
import { DlqQueryDto, BulkRetryDto, BulkArchiveDto } from './dto/dlq-query.dto';
export declare class DlqController {
    private readonly retryService;
    private readonly dlqService;
    private readonly dlqAlertService;
    constructor(retryService: RetryService, dlqService: DlqService, dlqAlertService: DlqAlertService);
    getStats(): Promise<{
        pending: number;
        retrying: number;
        failed: number;
        success: number;
        total: number;
        status: string;
    }>;
    getDlqEvents(query: DlqQueryDto): Promise<{
        data: import("../database/entities/dlq-event.entity").DlqEvent[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDlqEvent(id: number): Promise<import("../database/entities/dlq-event.entity").DlqEvent>;
    retryEvent(id: number): Promise<{
        success: boolean;
        message: string;
        eventId: number;
    }>;
    resetEvent(id: number): Promise<{
        success: boolean;
        message: string;
        eventId: number;
    }>;
    archiveEvent(id: number): Promise<{
        success: boolean;
        message: string;
        eventId: number;
    }>;
    deleteEvent(id: number): Promise<void>;
    bulkRetry(dto: BulkRetryDto): Promise<{
        count: number;
        successCount: number;
        failedCount: number;
        success: boolean;
        message: string;
    }>;
    bulkArchive(dto: BulkArchiveDto): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
    bulkDeleteArchived(): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
    triggerHealthCheck(): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTestAlert(): Promise<{
        success: boolean;
        message: string;
    }>;
}
