"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEventHandler = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../enums");
class BaseEventHandler {
    constructor(cdcTransformer, syncService, dlqService) {
        this.cdcTransformer = cdcTransformer;
        this.syncService = syncService;
        this.dlqService = dlqService;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async processEvent(message, tableName, syncHandler) {
        try {
            if (!this.cdcTransformer.validateCdcEvent(message)) {
                this.logger.error(enums_1.ERROR_MESSAGES.INVALID_CDC_EVENT_STRUCTURE, { message });
                await this.dlqService.sendToDlq({
                    eventId: message.id,
                    tableName,
                    operation: 'unknown',
                    payload: message,
                    errorMessage: enums_1.ERROR_MESSAGES.INVALID_CDC_EVENT_STRUCTURE,
                    maxRetries: enums_1.DLQ_CONFIG.DEFAULT_MAX_RETRIES,
                });
                return;
            }
            const domainEvent = this.cdcTransformer.transform(message);
            await syncHandler(domainEvent);
        }
        catch (error) {
            this.logger.error(`Failed to process event for table ${tableName}`, error.stack);
            await this.dlqService.sendToDlq({
                eventId: message.eventId || message.id,
                tableName,
                operation: message.__op || 'unknown',
                payload: message,
                errorMessage: error.message,
                maxRetries: enums_1.DLQ_CONFIG.DEFAULT_MAX_RETRIES,
            });
        }
    }
}
exports.BaseEventHandler = BaseEventHandler;
//# sourceMappingURL=base-event.handler.js.map