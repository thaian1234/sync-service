"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cms_product_entity_1 = require("../database/entities/cms-product.entity");
const cms_customer_entity_1 = require("../database/entities/cms-customer.entity");
const cms_order_entity_1 = require("../database/entities/cms-order.entity");
const processed_event_entity_1 = require("../database/entities/processed-event.entity");
const dlq_event_entity_1 = require("../database/entities/dlq-event.entity");
const sync_service_1 = require("../sync/sync.service");
const kafka_config_service_1 = require("./config/kafka-config.service");
const debezium_cdc_transformer_1 = require("./transformers/debezium-cdc.transformer");
const customer_event_handler_1 = require("./handlers/customer-event.handler");
const product_event_handler_1 = require("./handlers/product-event.handler");
const order_event_handler_1 = require("./handlers/order-event.handler");
const kafka_exception_filter_1 = require("./filters/kafka-exception.filter");
const dlq_service_1 = require("./services/dlq.service");
const dlq_alert_service_1 = require("./services/dlq-alert.service");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                cms_product_entity_1.CmsProduct,
                cms_customer_entity_1.CmsCustomer,
                cms_order_entity_1.CmsOrder,
                processed_event_entity_1.ProcessedEvent,
                dlq_event_entity_1.DlqEvent,
            ]),
        ],
        controllers: [
            customer_event_handler_1.CustomerEventHandler,
            product_event_handler_1.ProductEventHandler,
            order_event_handler_1.OrderEventHandler,
        ],
        providers: [
            kafka_config_service_1.KafkaConfigService,
            debezium_cdc_transformer_1.DebeziumCdcTransformer,
            sync_service_1.SyncService,
            dlq_service_1.DlqService,
            dlq_alert_service_1.DlqAlertService,
            dlq_alert_service_1.EmailAlertChannel,
            dlq_alert_service_1.SlackAlertChannel,
            dlq_alert_service_1.WebhookAlertChannel,
            kafka_exception_filter_1.KafkaExceptionFilter,
        ],
        exports: [
            kafka_config_service_1.KafkaConfigService,
            debezium_cdc_transformer_1.DebeziumCdcTransformer,
            sync_service_1.SyncService,
            dlq_service_1.DlqService,
            dlq_alert_service_1.DlqAlertService,
        ],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map