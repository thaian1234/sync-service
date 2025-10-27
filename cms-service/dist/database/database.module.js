"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const cms_product_entity_1 = require("./entities/cms-product.entity");
const cms_customer_entity_1 = require("./entities/cms-customer.entity");
const cms_order_entity_1 = require("./entities/cms-order.entity");
const processed_event_entity_1 = require("./entities/processed-event.entity");
const dlq_event_entity_1 = require("./entities/dlq-event.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DATABASE_HOST'),
                    port: configService.get('DATABASE_PORT'),
                    username: configService.get('DATABASE_USER'),
                    password: configService.get('DATABASE_PASSWORD'),
                    database: configService.get('DATABASE_NAME'),
                    entities: [cms_product_entity_1.CmsProduct, cms_customer_entity_1.CmsCustomer, cms_order_entity_1.CmsOrder, processed_event_entity_1.ProcessedEvent, dlq_event_entity_1.DlqEvent],
                    synchronize: true,
                    retryAttempts: 10,
                    retryDelay: 5000,
                    extra: {
                        connectionLimit: configService.get('DB_CONNECTION_POOL_SIZE', 10),
                        waitForConnections: true,
                        queueLimit: configService.get('DB_QUEUE_LIMIT', 0),
                        connectTimeout: configService.get('DB_CONNECT_TIMEOUT', 10000),
                        idleTimeout: configService.get('DB_IDLE_TIMEOUT', 60000),
                        enableKeepAlive: true,
                        keepAliveInitialDelay: 10000,
                    },
                    poolSize: configService.get('DB_CONNECTION_POOL_SIZE', 10),
                    logging: configService.get('DB_LOGGING', false),
                    logger: 'advanced-console',
                    maxQueryExecutionTime: configService.get('DB_SLOW_QUERY_THRESHOLD', 1000),
                }),
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map