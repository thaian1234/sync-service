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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEventHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const debezium_cdc_transformer_1 = require("../transformers/debezium-cdc.transformer");
const sync_service_1 = require("../../sync/sync.service");
const kafka_exception_filter_1 = require("../filters/kafka-exception.filter");
const dlq_service_1 = require("../services/dlq.service");
const base_event_handler_1 = require("./base-event.handler");
const enums_1 = require("../enums");
let OrderEventHandler = class OrderEventHandler extends base_event_handler_1.BaseEventHandler {
    constructor(cdcTransformer, syncService, dlqService) {
        super(cdcTransformer, syncService, dlqService);
    }
    async handleOrderChanged(message) {
        await this.processEvent(message, enums_1.CDC_TABLE_NAMES.ORDERS, (event) => this.syncService.syncOrderEvent(event));
    }
};
exports.OrderEventHandler = OrderEventHandler;
__decorate([
    (0, microservices_1.EventPattern)(enums_1.KAFKA_TOPICS.ORDERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderEventHandler.prototype, "handleOrderChanged", null);
exports.OrderEventHandler = OrderEventHandler = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseFilters)(kafka_exception_filter_1.KafkaExceptionFilter),
    __metadata("design:paramtypes", [debezium_cdc_transformer_1.DebeziumCdcTransformer,
        sync_service_1.SyncService,
        dlq_service_1.DlqService])
], OrderEventHandler);
//# sourceMappingURL=order-event.handler.js.map