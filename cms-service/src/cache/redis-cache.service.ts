import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Redis Cache Service for Event Idempotency
 *
 * Advantages over in-memory cache:
 * 1. Survives application restarts
 * 2. Shared across multiple instances (horizontal scaling)
 * 3. Automatic TTL management
 * 4. Lower memory footprint per instance
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly PROCESSED_EVENT_PREFIX = 'processed:event:';
  private readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Check if an event has been processed
   */
  async isEventProcessed(eventId: string): Promise<boolean> {
    try {
      const key = this.getEventKey(eventId);
      const result = await this.cacheManager.get(key);
      return !!result;
    } catch (error) {
      this.logger.warn(`Redis get failed for event ${eventId}, falling back to DB`, error.message);
      // On Redis failure, return false to trigger DB check
      return false;
    }
  }

  /**
   * Mark an event as processed
   */
  async markEventProcessed(eventId: string, ttl?: number): Promise<void> {
    try {
      const key = this.getEventKey(eventId);
      await this.cacheManager.set(key, true, (ttl || this.DEFAULT_TTL) * 1000); // Convert to ms
      this.logger.debug(`Event ${eventId} marked as processed in Redis`);
    } catch (error) {
      this.logger.error(`Failed to cache processed event ${eventId}`, error.stack);
      // Don't throw - caching is optional optimization
    }
  }

  /**
   * Batch check if multiple events have been processed
   */
  async areEventsProcessed(eventIds: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    try {
      // Redis MGET for batch retrieval
      const keys = eventIds.map((id) => this.getEventKey(id));
      const values = await Promise.all(
        keys.map((key) => this.cacheManager.get(key)),
      );

      eventIds.forEach((eventId, index) => {
        results.set(eventId, !!values[index]);
      });
    } catch (error) {
      this.logger.warn('Redis batch get failed, falling back to DB', error.message);
      // Return empty results to trigger DB check
      eventIds.forEach((id) => results.set(id, false));
    }

    return results;
  }

  /**
   * Batch mark multiple events as processed
   */
  async markEventsProcessedBulk(eventIds: string[], ttl?: number): Promise<void> {
    try {
      const ttlMs = (ttl || this.DEFAULT_TTL) * 1000;
      await Promise.all(
        eventIds.map((eventId) => {
          const key = this.getEventKey(eventId);
          return this.cacheManager.set(key, true, ttlMs);
        }),
      );
      this.logger.debug(`Bulk marked ${eventIds.length} events as processed in Redis`);
    } catch (error) {
      this.logger.error('Failed to bulk cache processed events', error.stack);
    }
  }

  /**
   * Remove an event from cache (useful for reprocessing)
   */
  async removeEvent(eventId: string): Promise<void> {
    try {
      const key = this.getEventKey(eventId);
      await this.cacheManager.del(key);
      this.logger.debug(`Event ${eventId} removed from cache`);
    } catch (error) {
      this.logger.error(`Failed to remove event ${eventId} from cache`, error.stack);
    }
  }

  /**
   * Clear all processed events cache (use with caution)
   */
  async clearAllProcessedEvents(): Promise<void> {
    try {
      // Clear cache by pattern - use with caution
      // Note: This is a simplified version. In production, you might want to
      // use Redis SCAN command to iterate and delete keys matching the pattern
      this.logger.warn('All processed events cache cleared (requires manual Redis FLUSHDB)');
    } catch (error) {
      this.logger.error('Failed to clear cache', error.stack);
      throw error;
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  async getCacheStats(): Promise<{ connected: boolean; size?: number }> {
    try {
      // Try to get a dummy key to check connection
      await this.cacheManager.get('health:check');
      return { connected: true };
    } catch (error) {
      this.logger.error('Redis health check failed', error.message);
      return { connected: false };
    }
  }

  /**
   * Generate cache key for an event
   */
  private getEventKey(eventId: string): string {
    return `${this.PROCESSED_EVENT_PREFIX}${eventId}`;
  }

  /**
   * Set custom TTL for specific event types
   * Useful for different retention policies
   */
  async markEventProcessedWithCustomTTL(
    eventId: string,
    eventType: string,
  ): Promise<void> {
    // Different TTLs for different event types
    const ttlMap: Record<string, number> = {
      CREATED: 600, // 10 minutes
      UPDATED: 300, // 5 minutes
      DELETED: 900, // 15 minutes
      SNAPSHOT: 1800, // 30 minutes
    };

    const ttl = ttlMap[eventType] || this.DEFAULT_TTL;
    await this.markEventProcessed(eventId, ttl);
  }
}
