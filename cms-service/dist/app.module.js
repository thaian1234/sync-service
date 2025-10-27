"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const database_module_1 = require("./database/database.module");
const kafka_module_1 = require("./kafka/kafka.module");
const health_module_1 = require("./health/health.module");
const products_module_1 = require("./products/products.module");
const customers_module_1 = require("./customers/customers.module");
const orders_module_1 = require("./orders/orders.module");
const dlq_controller_1 = require("./dlq/dlq.controller");
const sync_module_1 = require("./sync/sync.module");
const redis_cache_module_1 = require("./cache/redis-cache.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            redis_cache_module_1.RedisCacheModule,
            database_module_1.DatabaseModule,
            kafka_module_1.KafkaModule,
            health_module_1.HealthModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            orders_module_1.OrdersModule,
            sync_module_1.SyncModule,
        ],
        controllers: [dlq_controller_1.DlqController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map