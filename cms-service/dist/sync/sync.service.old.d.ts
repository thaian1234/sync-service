import { Repository } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
import { CmsOrder } from '../database/entities/cms-order.entity';
import { ProcessedEvent } from '../database/entities/processed-event.entity';
import { DlqEvent } from '../database/entities/dlq-event.entity';
import { BaseCdcEventDto } from '../kafka/dto/base-cdc-event.dto';
export declare class SyncService {
    private cmsProductRepository;
    private cmsCustomerRepository;
    private cmsOrderRepository;
    private processedEventRepository;
    private dlqEventRepository;
    constructor(cmsProductRepository: Repository<CmsProduct>, cmsCustomerRepository: Repository<CmsCustomer>, cmsOrderRepository: Repository<CmsOrder>, processedEventRepository: Repository<ProcessedEvent>, dlqEventRepository: Repository<DlqEvent>);
    private generateEventId;
    private isEventProcessed;
    private markEventProcessed;
    sendToDlq(eventId: string, table: string, op: string, payload: any, error: any): Promise<void>;
    syncEvent(cdcEvent: BaseCdcEventDto): Promise<void>;
    private syncProduct;
    private syncCustomer;
    private syncOrder;
}
