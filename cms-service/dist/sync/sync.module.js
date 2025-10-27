"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cms_product_entity_1 = require("../database/entities/cms-product.entity");
const cms_customer_entity_1 = require("../database/entities/cms-customer.entity");
const cms_order_entity_1 = require("../database/entities/cms-order.entity");
const processed_event_entity_1 = require("../database/entities/processed-event.entity");
const dlq_event_entity_1 = require("../database/entities/dlq-event.entity");
const sync_service_1 = require("./sync.service");
const retry_service_1 = require("./retry.service");
const debezium_cdc_transformer_1 = require("../kafka/transformers/debezium-cdc.transformer");
const kafka_module_1 = require("../kafka/kafka.module");
let SyncModule = class SyncModule {
};
exports.SyncModule = SyncModule;
exports.SyncModule = SyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                cms_product_entity_1.CmsProduct,
                cms_customer_entity_1.CmsCustomer,
                cms_order_entity_1.CmsOrder,
                processed_event_entity_1.ProcessedEvent,
                dlq_event_entity_1.DlqEvent,
            ]),
            kafka_module_1.KafkaModule,
        ],
        providers: [sync_service_1.SyncService, retry_service_1.RetryService, debezium_cdc_transformer_1.DebeziumCdcTransformer],
        exports: [sync_service_1.SyncService, retry_service_1.RetryService],
    })
], SyncModule);
//# sourceMappingURL=sync.module.js.map