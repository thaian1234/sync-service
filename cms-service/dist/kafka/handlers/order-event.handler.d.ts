import { DebeziumCdcTransformer } from '../transformers/debezium-cdc.transformer';
import { SyncService } from '../../sync/sync.service';
import { DlqService } from '../services/dlq.service';
import { BaseEventHandler } from './base-event.handler';
export declare class OrderEventHandler extends BaseEventHandler {
    constructor(cdcTransformer: DebeziumCdcTransformer, syncService: SyncService, dlqService: DlqService);
    handleOrderChanged(message: any): Promise<void>;
}
