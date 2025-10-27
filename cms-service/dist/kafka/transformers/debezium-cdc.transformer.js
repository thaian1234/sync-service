"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DebeziumCdcTransformer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebeziumCdcTransformer = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const customer_changed_event_1 = require("../events/customer-changed.event");
const product_changed_event_1 = require("../events/product-changed.event");
const order_changed_event_1 = require("../events/order-changed.event");
const domain_event_dto_1 = require("../dto/domain-event.dto");
const enums_1 = require("../enums");
let DebeziumCdcTransformer = DebeziumCdcTransformer_1 = class DebeziumCdcTransformer {
    constructor() {
        this.logger = new common_1.Logger(DebeziumCdcTransformer_1.name);
        this.tableTransformers = new Map([
            [
                enums_1.CDC_TABLE_NAMES.CUSTOMERS,
                (event) => this.transformCustomerEvent(event),
            ],
            [
                enums_1.CDC_TABLE_NAMES.PRODUCTS,
                (event) => this.transformProductEvent(event),
            ],
            [
                enums_1.CDC_TABLE_NAMES.ORDERS,
                (event) => this.transformOrderEvent(event),
            ],
        ]);
    }
    transform(cdcEvent) {
        const table = cdcEvent.__source_table;
        try {
            const validatedEvent = (0, class_transformer_1.plainToClass)(domain_event_dto_1.DebeziumCdcEventDto, cdcEvent);
            const errors = (0, class_validator_1.validateSync)(validatedEvent, {
                skipMissingProperties: true,
            });
            if (errors.length > 0) {
                const errorMessages = errors
                    .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`)
                    .join("; ");
                throw new Error(`CDC event validation failed: ${errorMessages}`);
            }
            const transformer = this.tableTransformers.get(table);
            if (!transformer) {
                throw new Error(enums_1.ERROR_MESSAGES.UNKNOWN_SOURCE_TABLE.replace("{table}", table));
            }
            return transformer(cdcEvent);
        }
        catch (error) {
            this.logger.error(`Failed to transform CDC event from table ${table}`, error);
            throw error;
        }
    }
    transformCustomerEvent(cdcEvent) {
        const eventType = this.mapOperationToEventType(cdcEvent.__op);
        const customerData = (0, class_transformer_1.plainToClass)(domain_event_dto_1.CustomerDto, {
            id: cdcEvent.id,
            name: cdcEvent.name,
            email: cdcEvent.email,
            phone: cdcEvent.phone,
            createdAt: cdcEvent.created_at
                ? new Date(cdcEvent.created_at / 1000)
                : undefined,
            updatedAt: cdcEvent.updated_at
                ? new Date(cdcEvent.updated_at / 1000)
                : undefined,
        });
        const errors = (0, class_validator_1.validateSync)(customerData, {
            skipMissingProperties: true,
        });
        if (errors.length > 0) {
            const errorMessages = errors
                .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`)
                .join("; ");
            throw new Error(`Customer data validation failed: ${errorMessages}`);
        }
        return new customer_changed_event_1.CustomerChangedEvent({
            eventId: customer_changed_event_1.CustomerChangedEvent.generateEventId(cdcEvent.id, cdcEvent.__op, cdcEvent.__source_ts_ms),
            type: eventType,
            source: cdcEvent.__source_table,
            timestamp: cdcEvent.__source_ts_ms,
            data: customerData,
            metadata: {
                snapshot: cdcEvent.__op === "r",
            },
        });
    }
    transformProductEvent(cdcEvent) {
        const eventType = this.mapOperationToEventType(cdcEvent.__op);
        const productData = (0, class_transformer_1.plainToClass)(domain_event_dto_1.ProductDto, {
            id: cdcEvent.id,
            name: cdcEvent.name,
            description: cdcEvent.description,
            price: parseFloat(cdcEvent.price),
            stock: cdcEvent.stock,
            category: cdcEvent.category,
            status: cdcEvent.status,
            createdAt: cdcEvent.created_at
                ? new Date(cdcEvent.created_at / 1000)
                : undefined,
            updatedAt: cdcEvent.updated_at
                ? new Date(cdcEvent.updated_at / 1000)
                : undefined,
        });
        const errors = (0, class_validator_1.validateSync)(productData, {
            skipMissingProperties: true,
        });
        if (errors.length > 0) {
            const errorMessages = errors
                .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`)
                .join("; ");
            throw new Error(`Product data validation failed: ${errorMessages}`);
        }
        return new product_changed_event_1.ProductChangedEvent({
            eventId: product_changed_event_1.ProductChangedEvent.generateEventId(cdcEvent.id, cdcEvent.__op, cdcEvent.__source_ts_ms),
            type: eventType,
            source: cdcEvent.__source_table,
            timestamp: cdcEvent.__source_ts_ms,
            data: productData,
            metadata: {
                snapshot: cdcEvent.__op === "r",
            },
        });
    }
    transformOrderEvent(cdcEvent) {
        const eventType = this.mapOperationToEventType(cdcEvent.__op);
        const orderData = (0, class_transformer_1.plainToClass)(domain_event_dto_1.OrderDto, {
            id: cdcEvent.id,
            customerId: cdcEvent.customer_id,
            total: parseFloat(cdcEvent.total),
            status: cdcEvent.status,
            createdAt: cdcEvent.created_at
                ? new Date(cdcEvent.created_at / 1000)
                : undefined,
            updatedAt: cdcEvent.updated_at
                ? new Date(cdcEvent.updated_at / 1000)
                : undefined,
        });
        const errors = (0, class_validator_1.validateSync)(orderData, { skipMissingProperties: true });
        if (errors.length > 0) {
            const errorMessages = errors
                .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`)
                .join("; ");
            throw new Error(`Order data validation failed: ${errorMessages}`);
        }
        return new order_changed_event_1.OrderChangedEvent({
            eventId: order_changed_event_1.OrderChangedEvent.generateEventId(cdcEvent.id, cdcEvent.__op, cdcEvent.__source_ts_ms),
            type: eventType,
            source: cdcEvent.__source_table,
            timestamp: cdcEvent.__source_ts_ms,
            data: orderData,
            metadata: {
                snapshot: cdcEvent.__op === "r",
            },
        });
    }
    mapOperationToEventType(op) {
        const eventType = enums_1.CDC_TO_EVENT_TYPE[op];
        if (!eventType) {
            throw new Error(enums_1.ERROR_MESSAGES.UNKNOWN_CDC_OPERATION.replace("{op}", op));
        }
        return eventType;
    }
    validateCdcEvent(event) {
        return (event &&
            typeof event === "object" &&
            "__op" in event &&
            "__source_ts_ms" in event &&
            "__source_table" in event &&
            "id" in event);
    }
};
exports.DebeziumCdcTransformer = DebeziumCdcTransformer;
exports.DebeziumCdcTransformer = DebeziumCdcTransformer = DebeziumCdcTransformer_1 = __decorate([
    (0, common_1.Injectable)()
], DebeziumCdcTransformer);
//# sourceMappingURL=debezium-cdc.transformer.js.map