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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cms_product_entity_1 = require("../database/entities/cms-product.entity");
const cms_customer_entity_1 = require("../database/entities/cms-customer.entity");
const cms_order_entity_1 = require("../database/entities/cms-order.entity");
const processed_event_entity_1 = require("../database/entities/processed-event.entity");
const dlq_event_entity_1 = require("../database/entities/dlq-event.entity");
const enums_1 = require("../kafka/enums");
let SyncService = class SyncService {
    constructor(cmsProductRepository, cmsCustomerRepository, cmsOrderRepository, processedEventRepository, dlqEventRepository) {
        this.cmsProductRepository = cmsProductRepository;
        this.cmsCustomerRepository = cmsCustomerRepository;
        this.cmsOrderRepository = cmsOrderRepository;
        this.processedEventRepository = processedEventRepository;
        this.dlqEventRepository = dlqEventRepository;
    }
    generateEventId(table, recordId, op, ts) {
        return `${table}-${recordId}-${op}-${ts}`;
    }
    async isEventProcessed(eventId) {
        const event = await this.processedEventRepository.findOneBy({ eventId });
        return !!event;
    }
    async markEventProcessed(queryRunner, eventId, table, recordId, op) {
        const event = new processed_event_entity_1.ProcessedEvent();
        event.eventId = eventId;
        event.tableName = table;
        event.recordId = recordId;
        event.operation = op;
        await queryRunner.manager.save(event);
    }
    async sendToDlq(eventId, table, op, payload, error) {
        const dlqEvent = new dlq_event_entity_1.DlqEvent();
        dlqEvent.eventId = eventId;
        dlqEvent.tableName = table;
        dlqEvent.operation = op;
        dlqEvent.payload = payload;
        dlqEvent.errorMessage = error.message;
        dlqEvent.status = enums_1.DlqStatus.PENDING;
        await this.dlqEventRepository.save(dlqEvent);
    }
    async syncEvent(cdcEvent) {
        const { __op: op, __source_ts_ms: ts, __source_table: table, id } = cdcEvent;
        const eventId = this.generateEventId(table, id, op, ts);
        if (await this.isEventProcessed(eventId)) {
            console.log(`Event ${eventId} already processed.`);
            return;
        }
        const queryRunner = this.cmsProductRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            switch (table) {
                case 'products':
                    await this.syncProduct(queryRunner, cdcEvent);
                    break;
                case 'customers':
                    await this.syncCustomer(queryRunner, cdcEvent);
                    break;
                case 'orders':
                    await this.syncOrder(queryRunner, cdcEvent);
                    break;
                default:
                    throw new Error(`Unknown table: ${table}`);
            }
            await this.markEventProcessed(queryRunner, eventId, table, id, op);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`Error syncing event ${eventId}:`, error);
            await this.sendToDlq(eventId, table, op, cdcEvent, error);
        }
        finally {
            await queryRunner.release();
        }
    }
    async syncProduct(queryRunner, event) {
        const { __op: op, id: coreProductId } = event;
        console.log(`Syncing product with core ID: ${coreProductId}, operation: ${op}`);
        switch (op) {
            case enums_1.CdcOperation.CREATE:
            case enums_1.CdcOperation.READ:
                await queryRunner.manager.upsert(cms_product_entity_1.CmsProduct, {
                    coreProductId,
                    name: event.name,
                    description: event.description,
                    price: event.price,
                    stock: event.stock,
                    category: event.category,
                    status: event.status,
                    syncedAt: new Date(),
                }, ['coreProductId']);
                break;
            case enums_1.CdcOperation.UPDATE:
                await queryRunner.manager.update(cms_product_entity_1.CmsProduct, { coreProductId }, {
                    name: event.name,
                    description: event.description,
                    price: event.price,
                    stock: event.stock,
                    category: event.category,
                    status: event.status,
                    syncedAt: new Date(),
                });
                break;
            case enums_1.CdcOperation.DELETE:
                await queryRunner.manager.delete(cms_product_entity_1.CmsProduct, { coreProductId });
                break;
            default:
                console.warn(`Unknown operation: ${op}`);
        }
    }
    async syncCustomer(queryRunner, event) {
        const { __op: op, id: coreCustomerId } = event;
        console.log(`Syncing customer with core ID: ${coreCustomerId}, operation: ${op}`);
        switch (op) {
            case enums_1.CdcOperation.CREATE:
            case enums_1.CdcOperation.READ:
                await queryRunner.manager.upsert(cms_customer_entity_1.CmsCustomer, {
                    coreCustomerId,
                    name: event.name,
                    email: event.email,
                    phone: event.phone,
                    syncedAt: new Date(),
                }, ['coreCustomerId']);
                break;
            case enums_1.CdcOperation.UPDATE:
                await queryRunner.manager.update(cms_customer_entity_1.CmsCustomer, { coreCustomerId }, {
                    name: event.name,
                    email: event.email,
                    phone: event.phone,
                    syncedAt: new Date(),
                });
                break;
            case enums_1.CdcOperation.DELETE:
                await queryRunner.manager.delete(cms_customer_entity_1.CmsCustomer, { coreCustomerId });
                break;
            default:
                console.warn(`Unknown operation: ${op}`);
        }
    }
    async syncOrder(queryRunner, event) {
        const { __op: op, id: coreOrderId } = event;
        console.log(`Syncing order with core ID: ${coreOrderId}, operation: ${op}`);
        switch (op) {
            case enums_1.CdcOperation.CREATE:
            case enums_1.CdcOperation.READ:
                await queryRunner.manager.upsert(cms_order_entity_1.CmsOrder, {
                    coreOrderId,
                    customerId: event.customer_id,
                    total: event.total,
                    status: event.status,
                    syncedAt: new Date(),
                }, ['coreOrderId']);
                break;
            case enums_1.CdcOperation.UPDATE:
                await queryRunner.manager.update(cms_order_entity_1.CmsOrder, { coreOrderId }, {
                    customerId: event.customer_id,
                    total: event.total,
                    status: event.status,
                    syncedAt: new Date(),
                });
                break;
            case enums_1.CdcOperation.DELETE:
                await queryRunner.manager.delete(cms_order_entity_1.CmsOrder, { coreOrderId });
                break;
            default:
                console.warn(`Unknown operation: ${op}`);
        }
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cms_product_entity_1.CmsProduct)),
    __param(1, (0, typeorm_1.InjectRepository)(cms_customer_entity_1.CmsCustomer)),
    __param(2, (0, typeorm_1.InjectRepository)(cms_order_entity_1.CmsOrder)),
    __param(3, (0, typeorm_1.InjectRepository)(processed_event_entity_1.ProcessedEvent)),
    __param(4, (0, typeorm_1.InjectRepository)(dlq_event_entity_1.DlqEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SyncService);
//# sourceMappingURL=sync.service.old.js.map