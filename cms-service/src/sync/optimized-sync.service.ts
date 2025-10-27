import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
import { CmsOrder } from '../database/entities/cms-order.entity';
import { ProcessedEvent } from '../database/entities/processed-event.entity';
import { EVENT_TYPE } from '../kafka/enums';
import { CustomerChangedEvent } from '../kafka/events/customer-changed.event';
import { ProductChangedEvent } from '../kafka/events/product-changed.event';
import { OrderChangedEvent } from '../kafka/events/order-changed.event';
import { RedisCacheService } from '../cache/redis-cache.service';

/**
 * Optimized Sync Service with reduced connection pool usage
 *
 * Key Optimizations:
 * 1. Single transaction per event (1 connection instead of 3)
 * 2. Bulk operations support
 * 3. Redis-based idempotency cache (shared across instances)
 * 4. Query optimization
 */
@Injectable()
export class OptimizedSyncService {
  private readonly logger = new Logger(OptimizedSyncService.name);

  constructor(
    @InjectRepository(CmsProduct)
    private cmsProductRepository: Repository<CmsProduct>,
    @InjectRepository(CmsCustomer)
    private cmsCustomerRepository: Repository<CmsCustomer>,
    @InjectRepository(CmsOrder)
    private cmsOrderRepository: Repository<CmsOrder>,
    @InjectRepository(ProcessedEvent)
    private processedEventRepository: Repository<ProcessedEvent>,
    private dataSource: DataSource,
    private redisCacheService: RedisCacheService,
  ) {}

  /**
   * OPTIMIZATION 1: Single Transaction per Event
   * Uses one connection for entire operation instead of multiple
   */
  async syncCustomerEventOptimized(event: CustomerChangedEvent): Promise<void> {
    try {
      // Quick Redis cache check (no DB connection needed!)
      if (await this.redisCacheService.isEventProcessed(event.eventId)) {
        this.logger.debug(`Customer event ${event.eventId} in Redis cache, skipping`);
        return;
      }

      // Only create DB connection if not in cache
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Double-check in DB (in case Redis was unavailable earlier)
        const isProcessed = await this.isEventProcessedInTransaction(
          queryRunner,
          event.eventId,
        );

        if (isProcessed) {
          // Cache the result for next time
          await this.redisCacheService.markEventProcessed(event.eventId);
          await queryRunner.rollbackTransaction();
          return;
        }

        const customerId = event.getCustomerId();

        // Perform sync operation
        await this.syncCustomerInTransaction(queryRunner, event, customerId);

        // Mark as processed in DB
        await this.markEventProcessedInTransaction(
          queryRunner,
          event.eventId,
          event.source,
          customerId,
          event.type,
        );

        // Commit transaction
        await queryRunner.commitTransaction();

        // Cache in Redis for future quick lookups (after successful commit)
        await this.redisCacheService.markEventProcessedWithCustomTTL(
          event.eventId,
          event.type,
        );

        this.logger.log(`Successfully synced customer event: ${event.eventId}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release connection immediately
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Failed to sync customer event ${event.eventId}`, error.stack);
      throw error;
    }
  }

  async syncProductEventOptimized(event: ProductChangedEvent): Promise<void> {
    try {
      // Quick Redis cache check
      if (await this.redisCacheService.isEventProcessed(event.eventId)) {
        this.logger.debug(`Product event ${event.eventId} in Redis cache, skipping`);
        return;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const isProcessed = await this.isEventProcessedInTransaction(
          queryRunner,
          event.eventId,
        );

        if (isProcessed) {
          await this.redisCacheService.markEventProcessed(event.eventId);
          await queryRunner.rollbackTransaction();
          return;
        }

        const productId = event.getProductId();

        await this.syncProductInTransaction(queryRunner, event, productId);

        await this.markEventProcessedInTransaction(
          queryRunner,
          event.eventId,
          event.source,
          productId,
          event.type,
        );

        await queryRunner.commitTransaction();

        // Cache in Redis after successful commit
        await this.redisCacheService.markEventProcessedWithCustomTTL(
          event.eventId,
          event.type,
        );

        this.logger.log(`Successfully synced product event: ${event.eventId}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Failed to sync product event ${event.eventId}`, error.stack);
      throw error;
    }
  }

  async syncOrderEventOptimized(event: OrderChangedEvent): Promise<void> {
    try {
      // Quick Redis cache check
      if (await this.redisCacheService.isEventProcessed(event.eventId)) {
        this.logger.debug(`Order event ${event.eventId} in Redis cache, skipping`);
        return;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const isProcessed = await this.isEventProcessedInTransaction(
          queryRunner,
          event.eventId,
        );

        if (isProcessed) {
          await this.redisCacheService.markEventProcessed(event.eventId);
          await queryRunner.rollbackTransaction();
          return;
        }

        const orderId = event.getOrderId();

        await this.syncOrderInTransaction(queryRunner, event, orderId);

        await this.markEventProcessedInTransaction(
          queryRunner,
          event.eventId,
          event.source,
          orderId,
          event.type,
        );

        await queryRunner.commitTransaction();

        // Cache in Redis after successful commit
        await this.redisCacheService.markEventProcessedWithCustomTTL(
          event.eventId,
          event.type,
        );

        this.logger.log(`Successfully synced order event: ${event.eventId}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Failed to sync order event ${event.eventId}`, error.stack);
      throw error;
    }
  }

  /**
   * OPTIMIZATION 2: Bulk Processing
   * Process multiple events in a single transaction
   */
  async syncCustomerEventsBulk(events: CustomerChangedEvent[]): Promise<void> {
    if (events.length === 0) return;

    try {
      const eventIds = events.map((e) => e.eventId);

      // Batch check Redis cache first
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

        // Batch check DB for uncached events
        const processedEvents = await queryRunner.manager
          .createQueryBuilder(ProcessedEvent, 'pe')
          .where('pe.eventId IN (:...eventIds)', { eventIds: uncachedEventIds })
          .getMany();

        const processedSet = new Set(processedEvents.map((e) => e.eventId));

        // Filter out already processed events
        const eventsToProcess = uncachedEvents.filter(
          (e) => !processedSet.has(e.eventId),
        );

        if (eventsToProcess.length === 0) {
          this.logger.debug('All events already processed in DB');
          await queryRunner.rollbackTransaction();
          return;
        }

        // Bulk sync operations
        for (const event of eventsToProcess) {
          const customerId = event.getCustomerId();
          await this.syncCustomerInTransaction(queryRunner, event, customerId);
        }

        // Bulk insert processed events
        const processedEventRecords = eventsToProcess.map((event) => ({
          eventId: event.eventId,
          tableName: event.source,
          recordId: event.getCustomerId(),
          operation: event.type,
        }));

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(ProcessedEvent)
          .values(processedEventRecords)
          .execute();

        await queryRunner.commitTransaction();

        // Bulk cache in Redis after successful commit
        const processedEventIds = eventsToProcess.map((e) => e.eventId);
        await this.redisCacheService.markEventsProcessedBulk(processedEventIds);

        this.logger.log(`Bulk synced ${eventsToProcess.length} customer events`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to bulk sync customer events', error.stack);
      throw error;
    }
  }

  // Similar bulk methods for products and orders...
  async syncProductEventsBulk(events: ProductChangedEvent[]): Promise<void> {
    // Implementation similar to syncCustomerEventsBulk
    // Left as exercise - follows same pattern
  }

  async syncOrderEventsBulk(events: OrderChangedEvent[]): Promise<void> {
    // Implementation similar to syncCustomerEventsBulk
    // Left as exercise - follows same pattern
  }

  /**
   * Helper: Check if event is processed within transaction
   */
  private async isEventProcessedInTransaction(
    queryRunner: QueryRunner,
    eventId: string,
  ): Promise<boolean> {
    const result = await queryRunner.manager
      .createQueryBuilder(ProcessedEvent, 'pe')
      .where('pe.eventId = :eventId', { eventId })
      .getOne();
    return !!result;
  }

  /**
   * Helper: Mark event as processed within transaction
   */
  private async markEventProcessedInTransaction(
    queryRunner: QueryRunner,
    eventId: string,
    table: string,
    recordId: number,
    operation: string,
  ): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(ProcessedEvent)
      .values({
        eventId,
        tableName: table,
        recordId,
        operation,
      })
      .execute();
  }

  /**
   * Helper: Sync customer within transaction
   */
  private async syncCustomerInTransaction(
    queryRunner: QueryRunner,
    event: CustomerChangedEvent,
    customerId: number,
  ): Promise<void> {
    switch (event.type) {
      case EVENT_TYPE.CREATED:
      case EVENT_TYPE.SNAPSHOT:
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CmsCustomer)
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

      case EVENT_TYPE.UPDATED:
        await queryRunner.manager
          .createQueryBuilder()
          .update(CmsCustomer)
          .set({
            name: event.data.name,
            email: event.data.email,
            phone: event.data.phone,
            syncedAt: new Date(),
          })
          .where('coreCustomerId = :customerId', { customerId })
          .execute();
        break;

      case EVENT_TYPE.DELETED:
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(CmsCustomer)
          .where('coreCustomerId = :customerId', { customerId })
          .execute();
        break;
    }
  }

  /**
   * Helper: Sync product within transaction
   */
  private async syncProductInTransaction(
    queryRunner: QueryRunner,
    event: ProductChangedEvent,
    productId: number,
  ): Promise<void> {
    switch (event.type) {
      case EVENT_TYPE.CREATED:
      case EVENT_TYPE.SNAPSHOT:
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CmsProduct)
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
          .orUpdate(
            ['name', 'description', 'price', 'stock', 'category', 'status', 'syncedAt'],
            ['coreProductId'],
          )
          .execute();
        break;

      case EVENT_TYPE.UPDATED:
        await queryRunner.manager
          .createQueryBuilder()
          .update(CmsProduct)
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

      case EVENT_TYPE.DELETED:
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(CmsProduct)
          .where('coreProductId = :productId', { productId })
          .execute();
        break;
    }
  }

  /**
   * Helper: Sync order within transaction
   */
  private async syncOrderInTransaction(
    queryRunner: QueryRunner,
    event: OrderChangedEvent,
    orderId: number,
  ): Promise<void> {
    switch (event.type) {
      case EVENT_TYPE.CREATED:
      case EVENT_TYPE.SNAPSHOT:
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CmsOrder)
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

      case EVENT_TYPE.UPDATED:
        await queryRunner.manager
          .createQueryBuilder()
          .update(CmsOrder)
          .set({
            customerId: event.data.customerId,
            total: event.data.total,
            status: event.data.status,
            syncedAt: new Date(),
          })
          .where('coreOrderId = :orderId', { orderId })
          .execute();
        break;

      case EVENT_TYPE.DELETED:
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(CmsOrder)
          .where('coreOrderId = :orderId', { orderId })
          .execute();
        break;
    }
  }

  /**
   * OPTIMIZATION 3: Redis Cache Management
   */

  /**
   * Clear Redis cache (useful for testing or manual interventions)
   */
  async clearCache(): Promise<void> {
    await this.redisCacheService.clearAllProcessedEvents();
    this.logger.log('Redis processed event cache cleared');
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{ connected: boolean; size?: number }> {
    return await this.redisCacheService.getCacheStats();
  }

  /**
   * Remove specific event from cache (for reprocessing)
   */
  async removeEventFromCache(eventId: string): Promise<void> {
    await this.redisCacheService.removeEvent(eventId);
    this.logger.log(`Event ${eventId} removed from cache`);
  }
}
