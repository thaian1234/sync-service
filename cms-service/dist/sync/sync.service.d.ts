import { Repository, DataSource } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
import { CmsOrder } from '../database/entities/cms-order.entity';
import { ProcessedEvent } from '../database/entities/processed-event.entity';
import { CustomerChangedEvent } from '../kafka/events/customer-changed.event';
import { ProductChangedEvent } from '../kafka/events/product-changed.event';
import { OrderChangedEvent } from '../kafka/events/order-changed.event';
import { RedisCacheService } from '../cache/redis-cache.service';
export declare class SyncService {
    private cmsProductRepository;
    private cmsCustomerRepository;
    private cmsOrderRepository;
    private processedEventRepository;
    private dataSource;
    private redisCacheService;
    private readonly logger;
    constructor(cmsProductRepository: Repository<CmsProduct>, cmsCustomerRepository: Repository<CmsCustomer>, cmsOrderRepository: Repository<CmsOrder>, processedEventRepository: Repository<ProcessedEvent>, dataSource: DataSource, redisCacheService: RedisCacheService);
    private isEventProcessedInTransaction;
    private markEventProcessedInTransaction;
    syncCustomerEvent(event: CustomerChangedEvent): Promise<void>;
    private syncCustomerInTransaction;
    syncProductEvent(event: ProductChangedEvent): Promise<void>;
    private syncProductInTransaction;
    syncOrderEvent(event: OrderChangedEvent): Promise<void>;
    private syncOrderInTransaction;
}
