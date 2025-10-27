"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OptimizedSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cms_product_entity_1 = require("../database/entities/cms-product.entity");
const cms_customer_entity_1 = require("../database/entities/cms-customer.entity");
const cms_order_entity_1 = require("../database/entities/cms-order.entity");
const processed_event_entity_1 = require("../database/entities/processed-event.entity");
const enums_1 = require("../kafka/enums");
const redis_cache_service_1 = require("../cache/redis-cache.service");
let OptimizedSyncService = OptimizedSyncService_1 = class OptimizedSyncService {
    constructor(cmsProductRepository, cmsCustomerRepository, cmsOrderRepository, processedEventRepository, dataSource, redisCacheService) {
        this.cmsProductRepository = cmsProductRepository;
        this.cmsCustomerRepository = cmsCustomerRepository;
        this.cmsOrderRepository = cmsOrderRepository;
        this.processedEventRepository = processedEventRepository;
        this.dataSource = dataSource;
        this.redisCacheService = redisCacheService;
        this.logger = new common_1.Logger(OptimizedSyncService_1.name);
    }
    async syncCustomerEventOptimized(event) {
        try {
            if (await this.redisCacheService.isEventProcessed(event.eventId)) {
                this.logger.debug(`Customer event ${event.eventId} in Redis cache, skipping`);
                return;
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const isProcessed = await this.isEventProcessedInTransaction(queryRunner, event.eventId);
                if (isProcessed) {
                    await this.redisCacheService.markEventProcessed(event.eventId);
                    await queryRunner.rollbackTransaction();
                    return;
                }
                const customerId = event.getCustomerId();
                await this.syncCustomerInTransaction(queryRunner, event, customerId);
                await this.markEventProcessedInTransaction(queryRunner, event.eventId, event.source, customerId, event.type);
                await queryRunner.commitTransaction();
                await this.redisCacheService.markEventProcessedWithCustomTTL(event.eventId, event.type);
                this.logger.log(`Successfully synced customer event: ${event.eventId}`);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync customer event ${event.eventId}`, error.stack);
            throw error;
        }
    }
    async syncProductEventOptimized(event) {
        try {
            if (await this.redisCacheService.isEventProcessed(event.eventId)) {
                this.logger.debug(`Product event ${event.eventId} in Redis cache, skipping`);
                return;
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const isProcessed = await this.isEventProcessedInTransaction(queryRunner, event.eventId);
                if (isProcessed) {
                    await this.redisCacheService.markEventProcessed(event.eventId);
                    await queryRunner.rollbackTransaction();
                    return;
                }
                const productId = event.getProductId();
                await this.syncProductInTransaction(queryRunner, event, productId);
                await this.markEventProcessedInTransaction(queryRunner, event.eventId, event.source, productId, event.type);
                await queryRunner.commitTransaction();
                await this.redisCacheService.markEventProcessedWithCustomTTL(event.eventId, event.type);
                this.logger.log(`Successfully synced product event: ${event.eventId}`);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync product event ${event.eventId}`, error.stack);
            throw error;
        }
    }
    async syncOrderEventOptimized(event) {
        try {
            if (await this.redisCacheService.isEventProcessed(event.eventId)) {
                this.logger.debug(`Order event ${event.eventId} in Redis cache, skipping`);
                return;
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const isProcessed = await this.isEventProcessedInTransaction(queryRunner, event.eventId);
                if (isProcessed) {
                    await this.redisCacheService.markEventProcessed(event.eventId);
                    await queryRunner.rollbackTransaction();
                    return;
                }
                const orderId = event.getOrderId();
                await this.syncOrderInTransaction(queryRunner, event, orderId);
                await this.markEventProcessedInTransaction(queryRunner, event.eventId, event.source, orderId, event.type);
                await queryRunner.commitTransaction();
                await this.redisCacheService.markEventProcessedWithCustomTTL(event.eventId, event.type);
                this.logger.log(`Successfully synced order event: ${event.eventId}`);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync order event ${event.eventId}`, error.stack);
            throw error;
        }
    }
    async syncCustomerEventsBulk(events) {
        if (events.length === 0)
            return;
        try {
            const eventIds = events.map((e) => e.eventId);
            const cachedResults = await this.redisCacheService.areEventsProcessed(eventIds);
            const uncachedEvents = events.filter((e) => !cachedResults.get(e.eventId));
            if (uncachedEvents.length === 0) {
                this.logger.debug('All events in Redis cache, skipping');
                return;
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const uncachedEventIds = uncachedEvents.map((e) => e.eventId);
                const processedEvents = await queryRunner.manager
                    .createQueryBuilder(processed_event_entity_1.ProcessedEvent, 'pe')
                    .where('pe.eventId IN (:...eventIds)', { eventIds: uncachedEventIds })
                    .getMany();
                const processedSet = new Set(processedEvents.map((e) => e.eventId));
                const eventsToProcess = uncachedEvents.filter((e) => !processedSet.has(e.eventId));
                if (eventsToProcess.length === 0) {
                    this.logger.debug('All events already processed in DB');
                    await queryRunner.rollbackTransaction();
                    return;
                }
                for (const event of eventsToProcess) {
                    const customerId = event.getCustomerId();
                    await this.syncCustomerInTransaction(queryRunner, event, customerId);
                }
                const processedEventRecords = eventsToProcess.map((event) => ({
                    eventId: event.eventId,
                    tableName: event.source,
                    recordId: event.getCustomerId(),
                    operation: event.type,
                }));
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(processed_event_entity_1.ProcessedEvent)
                    .values(processedEventRecords)
                    .execute();
                await queryRunner.commitTransaction();
                const processedEventIds = eventsToProcess.map((e) => e.eventId);
                await this.redisCacheService.markEventsProcessedBulk(processedEventIds);
                this.logger.log(`Bulk synced ${eventsToProcess.length} customer events`);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.logger.error('Failed to bulk sync customer events', error.stack);
            throw error;
        }
    }
    async syncProductEventsBulk(events) {
    }
    async syncOrderEventsBulk(events) {
    }
    async isEventProcessedInTransaction(queryRunner, eventId) {
        const result = await queryRunner.manager
            .createQueryBuilder(processed_event_entity_1.ProcessedEvent, 'pe')
            .where('pe.eventId = :eventId', { eventId })
            .getOne();
        return !!result;
    }
    async markEventProcessedInTransaction(queryRunner, eventId, table, recordId, operation) {
        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(processed_event_entity_1.ProcessedEvent)
            .values({
            eventId,
            tableName: table,
            recordId,
            operation,
        })
            .execute();
    }
    async syncCustomerInTransaction(queryRunner, event, customerId) {
        switch (event.type) {
            case enums_1.EVENT_TYPE.CREATED:
            case enums_1.EVENT_TYPE.SNAPSHOT:
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(cms_customer_entity_1.CmsCustomer)
                    .values({
                    coreCustomerId: customerId,
                    name: event.data.name,
                    email: event.data.email,
                    phone: event.data.phone,
                    syncedAt: new Date(),
                })
                    .orUpdate(['name', 'email', 'phone', 'syncedAt'], ['coreCustomerId'])
                    .execute();
                break;
            case enums_1.EVENT_TYPE.UPDATED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(cms_customer_entity_1.CmsCustomer)
                    .set({
                    name: event.data.name,
                    email: event.data.email,
                    phone: event.data.phone,
                    syncedAt: new Date(),
                })
                    .where('coreCustomerId = :customerId', { customerId })
                    .execute();
                break;
            case enums_1.EVENT_TYPE.DELETED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(cms_customer_entity_1.CmsCustomer)
                    .where('coreCustomerId = :customerId', { customerId })
                    .execute();
                break;
        }
    }
    async syncProductInTransaction(queryRunner, event, productId) {
        switch (event.type) {
            case enums_1.EVENT_TYPE.CREATED:
            case enums_1.EVENT_TYPE.SNAPSHOT:
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(cms_product_entity_1.CmsProduct)
                    .values({
                    coreProductId: productId,
                    name: event.data.name,
                    description: event.data.description,
                    price: event.data.price,
                    stock: event.data.stock,
                    category: event.data.category,
                    status: event.data.status,
                    syncedAt: new Date(),
                })
                    .orUpdate(['name', 'description', 'price', 'stock', 'category', 'status', 'syncedAt'], ['coreProductId'])
                    .execute();
                break;
            case enums_1.EVENT_TYPE.UPDATED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(cms_product_entity_1.CmsProduct)
                    .set({
                    name: event.data.name,
                    description: event.data.description,
                    price: event.data.price,
                    stock: event.data.stock,
                    category: event.data.category,
                    status: event.data.status,
                    syncedAt: new Date(),
                })
                    .where('coreProductId = :productId', { productId })
                    .execute();
                break;
            case enums_1.EVENT_TYPE.DELETED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(cms_product_entity_1.CmsProduct)
                    .where('coreProductId = :productId', { productId })
                    .execute();
                break;
        }
    }
    async syncOrderInTransaction(queryRunner, event, orderId) {
        switch (event.type) {
            case enums_1.EVENT_TYPE.CREATED:
            case enums_1.EVENT_TYPE.SNAPSHOT:
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(cms_order_entity_1.CmsOrder)
                    .values({
                    coreOrderId: orderId,
                    customerId: event.data.customerId,
                    total: event.data.total,
                    status: event.data.status,
                    syncedAt: new Date(),
                })
                    .orUpdate(['customerId', 'total', 'status', 'syncedAt'], ['coreOrderId'])
                    .execute();
                break;
            case enums_1.EVENT_TYPE.UPDATED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(cms_order_entity_1.CmsOrder)
                    .set({
                    customerId: event.data.customerId,
                    total: event.data.total,
                    status: event.data.status,
                    syncedAt: new Date(),
                })
                    .where('coreOrderId = :orderId', { orderId })
                    .execute();
                break;
            case enums_1.EVENT_TYPE.DELETED:
                await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(cms_order_entity_1.CmsOrder)
                    .where('coreOrderId = :orderId', { orderId })
                    .execute();
                break;
        }
    }
    async clearCache() {
        await this.redisCacheService.clearAllProcessedEvents();
        this.logger.log('Redis processed event cache cleared');
    }
    async getCacheStats() {
        return await this.redisCacheService.getCacheStats();
    }
    async removeEventFromCache(eventId) {
        await this.redisCacheService.removeEvent(eventId);
        this.logger.log(`Event ${eventId} removed from cache`);
    }
};
exports.OptimizedSyncService = OptimizedSyncService;
exports.OptimizedSyncService = OptimizedSyncService = OptimizedSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cms_product_entity_1.CmsProduct)),
    __param(1, (0, typeorm_1.InjectRepository)(cms_customer_entity_1.CmsCustomer)),
    __param(2, (0, typeorm_1.InjectRepository)(cms_order_entity_1.CmsOrder)),
    __param(3, (0, typeorm_1.InjectRepository)(processed_event_entity_1.ProcessedEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        redis_cache_service_1.RedisCacheService])
], OptimizedSyncService);
//# sourceMappingURL=optimized-sync.service.js.map