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
var RedisCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let RedisCacheService = RedisCacheService_1 = class RedisCacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(RedisCacheService_1.name);
        this.PROCESSED_EVENT_PREFIX = 'processed:event:';
        this.DEFAULT_TTL = 300;
    }
    async isEventProcessed(eventId) {
        try {
            const key = this.getEventKey(eventId);
            const result = await this.cacheManager.get(key);
            return !!result;
        }
        catch (error) {
            this.logger.warn(`Redis get failed for event ${eventId}, falling back to DB`, error.message);
            return false;
        }
    }
    async markEventProcessed(eventId, ttl) {
        try {
            const key = this.getEventKey(eventId);
            await this.cacheManager.set(key, true, (ttl || this.DEFAULT_TTL) * 1000);
            this.logger.debug(`Event ${eventId} marked as processed in Redis`);
        }
        catch (error) {
            this.logger.error(`Failed to cache processed event ${eventId}`, error.stack);
        }
    }
    async areEventsProcessed(eventIds) {
        const results = new Map();
        try {
            const keys = eventIds.map((id) => this.getEventKey(id));
            const values = await Promise.all(keys.map((key) => this.cacheManager.get(key)));
            eventIds.forEach((eventId, index) => {
                results.set(eventId, !!values[index]);
            });
        }
        catch (error) {
            this.logger.warn('Redis batch get failed, falling back to DB', error.message);
            eventIds.forEach((id) => results.set(id, false));
        }
        return results;
    }
    async markEventsProcessedBulk(eventIds, ttl) {
        try {
            const ttlMs = (ttl || this.DEFAULT_TTL) * 1000;
            await Promise.all(eventIds.map((eventId) => {
                const key = this.getEventKey(eventId);
                return this.cacheManager.set(key, true, ttlMs);
            }));
            this.logger.debug(`Bulk marked ${eventIds.length} events as processed in Redis`);
        }
        catch (error) {
            this.logger.error('Failed to bulk cache processed events', error.stack);
        }
    }
    async removeEvent(eventId) {
        try {
            const key = this.getEventKey(eventId);
            await this.cacheManager.del(key);
            this.logger.debug(`Event ${eventId} removed from cache`);
        }
        catch (error) {
            this.logger.error(`Failed to remove event ${eventId} from cache`, error.stack);
        }
    }
    async clearAllProcessedEvents() {
        try {
            this.logger.warn('All processed events cache cleared (requires manual Redis FLUSHDB)');
        }
        catch (error) {
            this.logger.error('Failed to clear cache', error.stack);
            throw error;
        }
    }
    async getCacheStats() {
        try {
            await this.cacheManager.get('health:check');
            return { connected: true };
        }
        catch (error) {
            this.logger.error('Redis health check failed', error.message);
            return { connected: false };
        }
    }
    getEventKey(eventId) {
        return `${this.PROCESSED_EVENT_PREFIX}${eventId}`;
    }
    async markEventProcessedWithCustomTTL(eventId, eventType) {
        const ttlMap = {
            CREATED: 600,
            UPDATED: 300,
            DELETED: 900,
            SNAPSHOT: 1800,
        };
        const ttl = ttlMap[eventType] || this.DEFAULT_TTL;
        await this.markEventProcessed(eventId, ttl);
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = RedisCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RedisCacheService);
//# sourceMappingURL=redis-cache.service.js.map