import { Logger } from '@nestjs/common';
import { DebeziumCdcTransformer } from '../transformers/debezium-cdc.transformer';
import { SyncService } from '../../sync/sync.service';
import { DlqService } from '../services/dlq.service';
export declare abstract class BaseEventHandler {
    protected readonly cdcTransformer: DebeziumCdcTransformer;
    protected readonly syncService: SyncService;
    protected readonly dlqService: DlqService;
    protected readonly logger: Logger;
    constructor(cdcTransformer: DebeziumCdcTransformer, syncService: SyncService, dlqService: DlqService);
    protected processEvent(message: any, tableName: string, syncHandler: (event: any) => Promise<void>): Promise<void>;
}
