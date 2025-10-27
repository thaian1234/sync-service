import { Repository, DataSource } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
import { CmsOrder } from '../database/entities/cms-order.entity';
import { ProcessedEvent } from '../database/entities/processed-event.entity';
import { CustomerChangedEvent } from '../kafka/events/customer-changed.event';
import { ProductChangedEvent } from '../kafka/events/product-changed.event';
import { OrderChangedEvent } from '../kafka/events/order-changed.event';
import { RedisCacheService } from '../cache/redis-cache.service';
export declare class OptimizedSyncService {
    private cmsProductRepository;
    private cmsCustomerRepository;
    private cmsOrderRepository;
    private processedEventRepository;
    private dataSource;
    private redisCacheService;
    private readonly logger;
    constructor(cmsProductRepository: Repository<CmsProduct>, cmsCustomerRepository: Repository<CmsCustomer>, cmsOrderRepository: Repository<CmsOrder>, processedEventRepository: Repository<ProcessedEvent>, dataSource: DataSource, redisCacheService: RedisCacheService);
    syncCustomerEventOptimized(event: CustomerChangedEvent): Promise<void>;
    syncProductEventOptimized(event: ProductChangedEvent): Promise<void>;
    syncOrderEventOptimized(event: OrderChangedEvent): Promise<void>;
    syncCustomerEventsBulk(events: CustomerChangedEvent[]): Promise<void>;
    syncProductEventsBulk(events: ProductChangedEvent[]): Promise<void>;
    syncOrderEventsBulk(events: OrderChangedEvent[]): Promise<void>;
    private isEventProcessedInTransaction;
    private markEventProcessedInTransaction;
    private syncCustomerInTransaction;
    private syncProductInTransaction;
    private syncOrderInTransaction;
    clearCache(): Promise<void>;
    getCacheStats(): Promise<{
        connected: boolean;
        size?: number;
    }>;
    removeEventFromCache(eventId: string): Promise<void>;
}
