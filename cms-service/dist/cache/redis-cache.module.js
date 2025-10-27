"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_ioredis_yet_1 = require("cache-manager-ioredis-yet");
const redis_cache_service_1 = require("./redis-cache.service");
let RedisCacheModule = class RedisCacheModule {
};
exports.RedisCacheModule = RedisCacheModule;
exports.RedisCacheModule = RedisCacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    store: cache_manager_ioredis_yet_1.redisStore,
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    password: configService.get('REDIS_PASSWORD'),
                    db: configService.get('REDIS_DB', 0),
                    ttl: configService.get('REDIS_TTL', 300),
                    maxRetriesPerRequest: 3,
                    enableReadyCheck: true,
                    enableOfflineQueue: true,
                    retryStrategy: (times) => {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                }),
            }),
        ],
        providers: [redis_cache_service_1.RedisCacheService],
        exports: [redis_cache_service_1.RedisCacheService, cache_manager_1.CacheModule],
    })
], RedisCacheModule);
//# sourceMappingURL=redis-cache.module.js.map