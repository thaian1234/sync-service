import { Cache } from 'cache-manager';
export declare class RedisCacheService {
    private cacheManager;
    private readonly logger;
    private readonly PROCESSED_EVENT_PREFIX;
    private readonly DEFAULT_TTL;
    constructor(cacheManager: Cache);
    isEventProcessed(eventId: string): Promise<boolean>;
    markEventProcessed(eventId: string, ttl?: number): Promise<void>;
    areEventsProcessed(eventIds: string[]): Promise<Map<string, boolean>>;
    markEventsProcessedBulk(eventIds: string[], ttl?: number): Promise<void>;
    removeEvent(eventId: string): Promise<void>;
    clearAllProcessedEvents(): Promise<void>;
    getCacheStats(): Promise<{
        connected: boolean;
        size?: number;
    }>;
    private getEventKey;
    markEventProcessedWithCustomTTL(eventId: string, eventType: string): Promise<void>;
}
