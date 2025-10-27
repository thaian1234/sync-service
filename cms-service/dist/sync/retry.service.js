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
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dlq_event_entity_1 = require("../database/entities/dlq-event.entity");
const enums_1 = require("../kafka/enums");
const sync_service_1 = require("./sync.service");
const debezium_cdc_transformer_1 = require("../kafka/transformers/debezium-cdc.transformer");
const dlq_service_1 = require("../kafka/services/dlq.service");
const dlq_alert_service_1 = require("../kafka/services/dlq-alert.service");
let RetryService = RetryService_1 = class RetryService {
    constructor(dlqEventRepository, syncService, cdcTransformer, dlqService, dataSource, dlqAlertService) {
        this.dlqEventRepository = dlqEventRepository;
        this.syncService = syncService;
        this.cdcTransformer = cdcTransformer;
        this.dlqService = dlqService;
        this.dataSource = dataSource;
        this.dlqAlertService = dlqAlertService;
        this.logger = new common_1.Logger(RetryService_1.name);
    }
    async autoRetryFailedEvents() {
        this.logger.log("Running auto-retry for DLQ events...");
        let totalSuccessCount = 0;
        let totalFailedCount = 0;
        let totalAttempted = 0;
        const batchSize = 100;
        while (true) {
            const eventsToRetry = await this.dlqService.getEventsReadyForRetry(batchSize);
            if (eventsToRetry.length === 0) {
                break;
            }
            this.logger.log(`Processing batch of ${eventsToRetry.length} events (total so far: ${totalAttempted})`);
            let batchSuccessCount = 0;
            let batchFailedCount = 0;
            for (const event of eventsToRetry) {
                const success = await this.retryEvent(event.id);
                if (success) {
                    batchSuccessCount++;
                }
                else {
                    batchFailedCount++;
                }
            }
            totalAttempted += eventsToRetry.length;
            totalSuccessCount += batchSuccessCount;
            totalFailedCount += batchFailedCount;
            this.logger.log({
                message: "Batch completed",
                batchSize: eventsToRetry.length,
                batchSuccessCount,
                batchFailedCount,
            });
            if (eventsToRetry.length < batchSize) {
                break;
            }
        }
        if (totalAttempted > 0) {
            this.logger.log({
                message: "Auto-retry completed",
                totalAttempted,
                successCount: totalSuccessCount,
                failedCount: totalFailedCount,
            });
        }
        else {
            this.logger.debug("No events ready for retry");
        }
        try {
            await this.dlqAlertService.checkAndAlert();
        }
        catch (error) {
            this.logger.error("Failed to check DLQ alerts", error.stack);
        }
    }
    async retryEvent(dlqEventId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const dlqEvent = await queryRunner.manager.findOneBy(dlq_event_entity_1.DlqEvent, {
                id: dlqEventId,
            });
            if (!dlqEvent) {
                this.logger.warn(`DLQ event ${dlqEventId} not found`);
                await queryRunner.rollbackTransaction();
                return false;
            }
            if (dlqEvent.status !== enums_1.DlqStatus.PENDING) {
                this.logger.debug(`DLQ event ${dlqEventId} is not in PENDING status (current: ${dlqEvent.status})`);
                await queryRunner.rollbackTransaction();
                return false;
            }
            if (dlqEvent.retryCount >= dlqEvent.maxRetries) {
                dlqEvent.status = enums_1.DlqStatus.FAILED;
                dlqEvent.errorMessage = "Max retries exceeded";
                await queryRunner.manager.save(dlqEvent);
                await queryRunner.commitTransaction();
                return false;
            }
            dlqEvent.status = enums_1.DlqStatus.RETRYING;
            await queryRunner.manager.save(dlqEvent);
            const domainEvent = this.cdcTransformer.transform(dlqEvent.payload);
            switch (dlqEvent.tableName) {
                case "customers":
                    await this.syncService.syncCustomerEvent(domainEvent);
                    break;
                case "products":
                    await this.syncService.syncProductEvent(domainEvent);
                    break;
                case "orders":
                    await this.syncService.syncOrderEvent(domainEvent);
                    break;
                default:
                    throw new Error(`Unknown table: ${dlqEvent.tableName}`);
            }
            dlqEvent.status = enums_1.DlqStatus.SUCCESS;
            await queryRunner.manager.save(dlqEvent);
            await queryRunner.commitTransaction();
            this.logger.log(`Successfully retried DLQ event ${dlqEventId} (attempt ${dlqEvent.retryCount + 1})`);
            return true;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Retry failed for DLQ event ${dlqEventId}`, error.stack);
            try {
                await this.dlqService.incrementRetryCount(dlqEventId, error.message);
            }
            catch (updateError) {
                this.logger.error(`Failed to update retry count for DLQ event ${dlqEventId}`, updateError.stack);
            }
            return false;
        }
        finally {
            await queryRunner.release();
        }
    }
    getDlqEvents(status, page, limit) {
        return this.dlqEventRepository.findAndCount({
            where: { status },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async resetEvent(dlqEventId) {
        const dlqEvent = await this.dlqEventRepository.findOneBy({
            id: dlqEventId,
        });
        if (dlqEvent) {
            dlqEvent.retryCount = 0;
            dlqEvent.status = enums_1.DlqStatus.PENDING;
            await this.dlqEventRepository.save(dlqEvent);
        }
    }
    async getDlqEventById(id) {
        const event = await this.dlqEventRepository.findOneBy({ id });
        if (!event) {
            throw new common_1.NotFoundException(`DLQ event with ID ${id} not found`);
        }
        return event;
    }
    async getDlqEventsAdvanced(query) {
        const { status, tableName, operation, page = 1, limit = 10, createdAfter, createdBefore } = query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (tableName) {
            whereClause.tableName = tableName;
        }
        if (operation) {
            whereClause.operation = operation;
        }
        if (createdAfter && createdBefore) {
            whereClause.createdAt = (0, typeorm_2.Between)(new Date(createdAfter), new Date(createdBefore));
        }
        else if (createdAfter) {
            whereClause.createdAt = (0, typeorm_2.Between)(new Date(createdAfter), new Date());
        }
        else if (createdBefore) {
            whereClause.createdAt = (0, typeorm_2.LessThan)(new Date(createdBefore));
        }
        const [data, total] = await this.dlqEventRepository.findAndCount({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async archiveEvent(id) {
        const event = await this.getDlqEventById(id);
        event.status = enums_1.DlqStatus.ARCHIVED;
        await this.dlqEventRepository.save(event);
        this.logger.log(`DLQ event ${id} archived`);
    }
    async deleteEvent(id) {
        const event = await this.getDlqEventById(id);
        await this.dlqEventRepository.remove(event);
        this.logger.log(`DLQ event ${id} deleted permanently`);
    }
    async bulkRetry(dto) {
        const { status, tableName, limit = 100 } = dto;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (tableName) {
            whereClause.tableName = tableName;
        }
        const events = await this.dlqEventRepository.find({
            where: whereClause,
            take: limit,
            order: { createdAt: "ASC" },
        });
        let successCount = 0;
        let failedCount = 0;
        for (const event of events) {
            const success = await this.retryEvent(event.id);
            if (success) {
                successCount++;
            }
            else {
                failedCount++;
            }
        }
        this.logger.log({
            message: "Bulk retry completed",
            total: events.length,
            successCount,
            failedCount,
            criteria: dto,
        });
        return {
            count: events.length,
            successCount,
            failedCount,
        };
    }
    async bulkArchive(dto) {
        const { olderThan, status } = dto;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (olderThan) {
            whereClause.createdAt = (0, typeorm_2.LessThan)(new Date(olderThan));
        }
        const result = await this.dlqEventRepository.update(whereClause, {
            status: enums_1.DlqStatus.ARCHIVED,
        });
        const count = result.affected || 0;
        this.logger.log(`Bulk archived ${count} events`);
        return count;
    }
    async deleteArchivedEvents() {
        const result = await this.dlqEventRepository.delete({
            status: enums_1.DlqStatus.ARCHIVED,
        });
        const count = result.affected || 0;
        this.logger.log(`Deleted ${count} archived events`);
        return count;
    }
};
exports.RetryService = RetryService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RetryService.prototype, "autoRetryFailedEvents", null);
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dlq_event_entity_1.DlqEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sync_service_1.SyncService,
        debezium_cdc_transformer_1.DebeziumCdcTransformer,
        dlq_service_1.DlqService,
        typeorm_2.DataSource,
        dlq_alert_service_1.DlqAlertService])
], RetryService);
//# sourceMappingURL=retry.service.js.map