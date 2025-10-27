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
var DlqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dlq_event_entity_1 = require("../../database/entities/dlq-event.entity");
const enums_1 = require("../enums");
let DlqService = DlqService_1 = class DlqService {
    constructor(dlqEventRepository) {
        this.dlqEventRepository = dlqEventRepository;
        this.logger = new common_1.Logger(DlqService_1.name);
    }
    async sendToDlq(input) {
        var _a;
        const dlqEvent = this.dlqEventRepository.create({
            eventId: input.eventId,
            tableName: input.tableName,
            operation: input.operation,
            payload: input.payload,
            errorMessage: input.errorMessage,
            maxRetries: (_a = input.maxRetries) !== null && _a !== void 0 ? _a : 5,
            retryCount: 0,
            status: enums_1.DlqStatus.PENDING,
        });
        const saved = await this.dlqEventRepository.save(dlqEvent);
        this.logger.warn({
            message: 'Event sent to DLQ',
            eventId: input.eventId,
            tableName: input.tableName,
            operation: input.operation,
            error: input.errorMessage,
        });
        return saved;
    }
    async sendBatchToDlq(inputs) {
        if (inputs.length === 0)
            return [];
        const dlqEvents = inputs.map((input) => {
            var _a;
            return this.dlqEventRepository.create({
                eventId: input.eventId,
                tableName: input.tableName,
                operation: input.operation,
                payload: input.payload,
                errorMessage: input.errorMessage,
                maxRetries: (_a = input.maxRetries) !== null && _a !== void 0 ? _a : 5,
                retryCount: 0,
                status: enums_1.DlqStatus.PENDING,
            });
        });
        const saved = await this.dlqEventRepository.save(dlqEvents);
        this.logger.warn({
            message: 'Batch events sent to DLQ',
            count: inputs.length,
            tables: [...new Set(inputs.map((i) => i.tableName))],
        });
        return saved;
    }
    calculateBackoffDelay(retryCount, baseDelayMs = enums_1.DLQ_CONFIG.BASE_DELAY_MS, maxDelayMs = enums_1.DLQ_CONFIG.MAX_DELAY_MS) {
        const delay = Math.min(baseDelayMs * Math.pow(2, retryCount), maxDelayMs);
        const jitter = Math.random() * enums_1.DLQ_CONFIG.JITTER_FACTOR * delay;
        return Math.floor(delay + jitter);
    }
    isReadyForRetry(dlqEvent) {
        if (dlqEvent.status !== enums_1.DlqStatus.PENDING) {
            return false;
        }
        if (dlqEvent.retryCount >= dlqEvent.maxRetries) {
            return false;
        }
        if (!dlqEvent.lastRetryAt) {
            return true;
        }
        const backoffDelay = this.calculateBackoffDelay(dlqEvent.retryCount);
        const nextRetryTime = new Date(dlqEvent.lastRetryAt.getTime() + backoffDelay);
        return new Date() >= nextRetryTime;
    }
    async getEventsReadyForRetry(limit = enums_1.DLQ_CONFIG.DEFAULT_FETCH_LIMIT) {
        const pendingEvents = await this.dlqEventRepository.find({
            where: { status: enums_1.DlqStatus.PENDING },
            order: { createdAt: 'ASC' },
            take: limit * enums_1.DLQ_CONFIG.FETCH_MULTIPLIER,
        });
        return pendingEvents.filter((event) => this.isReadyForRetry(event)).slice(0, limit);
    }
    async markAsRetrying(eventId) {
        await this.dlqEventRepository.update(eventId, {
            status: enums_1.DlqStatus.RETRYING,
            lastRetryAt: new Date(),
        });
    }
    async markAsSuccess(eventId) {
        await this.dlqEventRepository.update(eventId, {
            status: enums_1.DlqStatus.SUCCESS,
        });
        this.logger.log({
            message: 'DLQ event successfully processed',
            eventId,
        });
    }
    async markAsFailed(eventId, errorMessage) {
        await this.dlqEventRepository.update(eventId, {
            status: enums_1.DlqStatus.FAILED,
            errorMessage,
        });
        this.logger.error({
            message: 'DLQ event permanently failed after max retries',
            eventId,
            error: errorMessage,
        });
    }
    async incrementRetryCount(eventId, errorMessage) {
        const event = await this.dlqEventRepository.findOne({ where: { id: eventId } });
        if (!event)
            return;
        event.retryCount += 1;
        event.errorMessage = errorMessage;
        event.lastRetryAt = new Date();
        if (event.retryCount >= event.maxRetries) {
            event.status = enums_1.DlqStatus.FAILED;
        }
        else {
            event.status = enums_1.DlqStatus.PENDING;
        }
        await this.dlqEventRepository.save(event);
    }
    async getStats() {
        const [pending, retrying, failed, success] = await Promise.all([
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.PENDING } }),
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.RETRYING } }),
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.FAILED } }),
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.SUCCESS } }),
        ]);
        return {
            pending,
            retrying,
            failed,
            success,
            total: pending + retrying + failed + success,
        };
    }
};
exports.DlqService = DlqService;
exports.DlqService = DlqService = DlqService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dlq_event_entity_1.DlqEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DlqService);
//# sourceMappingURL=dlq.service.js.map