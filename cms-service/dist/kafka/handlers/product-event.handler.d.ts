import { DebeziumCdcTransformer } from '../transformers/debezium-cdc.transformer';
import { SyncService } from '../../sync/sync.service';
import { DlqService } from '../services/dlq.service';
import { BaseEventHandler } from './base-event.handler';
export declare class ProductEventHandler extends BaseEventHandler {
    constructor(cdcTransformer: DebeziumCdcTransformer, syncService: SyncService, dlqService: DlqService);
    handleProductChanged(message: any): Promise<void>;
}
