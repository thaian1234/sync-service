import { DataSource, Repository } from "typeorm";
import { DlqEvent } from "../database/entities/dlq-event.entity";
import { DlqStatus } from "../kafka/enums";
import { SyncService } from "./sync.service";
import { DebeziumCdcTransformer } from "../kafka/transformers/debezium-cdc.transformer";
import { DlqService } from "../kafka/services/dlq.service";
import { DlqAlertService } from "../kafka/services/dlq-alert.service";
import { DlqQueryDto, BulkRetryDto, BulkArchiveDto } from "../dlq/dto/dlq-query.dto";
export declare class RetryService {
    private dlqEventRepository;
    private syncService;
    private cdcTransformer;
    private dlqService;
    private dataSource;
    private dlqAlertService;
    private readonly logger;
    constructor(dlqEventRepository: Repository<DlqEvent>, syncService: SyncService, cdcTransformer: DebeziumCdcTransformer, dlqService: DlqService, dataSource: DataSource, dlqAlertService: DlqAlertService);
    autoRetryFailedEvents(): Promise<void>;
    retryEvent(dlqEventId: number): Promise<boolean>;
    getDlqEvents(status: DlqStatus, page: number, limit: number): Promise<[DlqEvent[], number]>;
    resetEvent(dlqEventId: number): Promise<void>;
    getDlqEventById(id: number): Promise<DlqEvent>;
    getDlqEventsAdvanced(query: DlqQueryDto): Promise<{
        data: DlqEvent[];
        total: number;
        page: number;
        limit: number;
    }>;
    archiveEvent(id: number): Promise<void>;
    deleteEvent(id: number): Promise<void>;
    bulkRetry(dto: BulkRetryDto): Promise<{
        count: number;
        successCount: number;
        failedCount: number;
    }>;
    bulkArchive(dto: BulkArchiveDto): Promise<number>;
    deleteArchivedEvents(): Promise<number>;
}
