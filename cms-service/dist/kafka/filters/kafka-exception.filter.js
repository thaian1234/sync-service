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
var KafkaExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaExceptionFilter = exports.NonRetryableError = exports.RetryableError = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dlq_event_entity_1 = require("../../database/entities/dlq-event.entity");
const enums_1 = require("../enums");
class RetryableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RetryableError';
    }
}
exports.RetryableError = RetryableError;
class NonRetryableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NonRetryableError';
    }
}
exports.NonRetryableError = NonRetryableError;
let KafkaExceptionFilter = KafkaExceptionFilter_1 = class KafkaExceptionFilter {
    constructor(dlqRepository) {
        this.dlqRepository = dlqRepository;
        this.logger = new common_1.Logger(KafkaExceptionFilter_1.name);
    }
    async catch(exception, host) {
        const ctx = host.switchToRpc();
        const data = ctx.getData();
        const eventId = (data === null || data === void 0 ? void 0 : data.eventId) || 'unknown';
        const source = (data === null || data === void 0 ? void 0 : data.source) || 'unknown';
        const type = (data === null || data === void 0 ? void 0 : data.type) || 'unknown';
        this.logger.error(`Exception in Kafka event handler: ${exception.message}`, {
            eventId,
            source,
            type,
            error: exception.name,
            stack: exception.stack,
        });
        const isRetryable = this.isRetryableError(exception);
        if (!isRetryable) {
            await this.sendToDlq(eventId, source, type, data, exception);
            this.logger.warn(`Event ${eventId} sent to DLQ due to non-retryable error`);
            return;
        }
        this.logger.warn(`Event ${eventId} will be retried due to retryable error`);
        throw exception;
    }
    isRetryableError(error) {
        if (error instanceof NonRetryableError) {
            return false;
        }
        if (error instanceof RetryableError) {
            return true;
        }
        const message = error.message;
        const retryablePatterns = Object.values(enums_1.ERROR_PATTERNS.RETRYABLE);
        if (retryablePatterns.some(pattern => message.includes(pattern))) {
            return true;
        }
        const nonRetryablePatterns = Object.values(enums_1.ERROR_PATTERNS.NON_RETRYABLE);
        if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
            return false;
        }
        return false;
    }
    async sendToDlq(eventId, source, type, payload, error) {
        try {
            const dlqEvent = new dlq_event_entity_1.DlqEvent();
            dlqEvent.eventId = eventId;
            dlqEvent.tableName = source;
            dlqEvent.operation = type;
            dlqEvent.payload = payload;
            dlqEvent.errorMessage = error.message;
            dlqEvent.status = enums_1.DlqStatus.PENDING;
            dlqEvent.retryCount = 0;
            await this.dlqRepository.save(dlqEvent);
            this.logger.log(`Successfully saved event ${eventId} to DLQ`);
        }
        catch (dlqError) {
            this.logger.error(`Failed to save event ${eventId} to DLQ: ${dlqError.message}`, dlqError.stack);
        }
    }
};
exports.KafkaExceptionFilter = KafkaExceptionFilter;
exports.KafkaExceptionFilter = KafkaExceptionFilter = KafkaExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dlq_event_entity_1.DlqEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KafkaExceptionFilter);
//# sourceMappingURL=kafka-exception.filter.js.map