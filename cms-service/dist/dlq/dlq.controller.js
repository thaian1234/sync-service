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
exports.DlqController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const retry_service_1 = require("../sync/retry.service");
const dlq_service_1 = require("../kafka/services/dlq.service");
const dlq_alert_service_1 = require("../kafka/services/dlq-alert.service");
const enums_1 = require("../kafka/enums");
const dlq_query_dto_1 = require("./dto/dlq-query.dto");
let DlqController = class DlqController {
    constructor(retryService, dlqService, dlqAlertService) {
        this.retryService = retryService;
        this.dlqService = dlqService;
        this.dlqAlertService = dlqAlertService;
    }
    async getStats() {
        const stats = await this.dlqService.getStats();
        const health = Object.assign({ status: stats.failed > 10 ? 'unhealthy' : stats.pending > 100 ? 'degraded' : 'healthy' }, stats);
        return health;
    }
    async getDlqEvents(query) {
        return this.retryService.getDlqEventsAdvanced(query);
    }
    async getDlqEvent(id) {
        return this.retryService.getDlqEventById(id);
    }
    async retryEvent(id) {
        const success = await this.retryService.retryEvent(id);
        return {
            success,
            message: success ? 'Event retried successfully' : 'Event retry failed',
            eventId: id,
        };
    }
    async resetEvent(id) {
        await this.retryService.resetEvent(id);
        return {
            success: true,
            message: 'Event retry count reset successfully',
            eventId: id,
        };
    }
    async archiveEvent(id) {
        await this.retryService.archiveEvent(id);
        return {
            success: true,
            message: 'Event archived successfully',
            eventId: id,
        };
    }
    async deleteEvent(id) {
        await this.retryService.deleteEvent(id);
    }
    async bulkRetry(dto) {
        const result = await this.retryService.bulkRetry(dto);
        return Object.assign({ success: true, message: `Initiated retry for ${result.count} events` }, result);
    }
    async bulkArchive(dto) {
        const count = await this.retryService.bulkArchive(dto);
        return {
            success: true,
            message: `Archived ${count} events`,
            count,
        };
    }
    async bulkDeleteArchived() {
        const count = await this.retryService.deleteArchivedEvents();
        return {
            success: true,
            message: `Deleted ${count} archived events`,
            count,
        };
    }
    async triggerHealthCheck() {
        await this.dlqAlertService.checkAndAlert();
        return {
            success: true,
            message: 'Health check completed, alerts sent if thresholds exceeded',
        };
    }
    async sendTestAlert() {
        await this.dlqAlertService.sendCustomAlert(enums_1.AlertSeverity.INFO, 'DLQ Alert System Test', 'This is a test alert to verify that the DLQ alerting system is working correctly.', { test: true, timestamp: new Date().toISOString() });
        return {
            success: true,
            message: 'Test alert sent to all configured channels',
        };
    }
};
exports.DlqController = DlqController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get DLQ statistics and health metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns DLQ statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all DLQ events with advanced filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated DLQ events' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dlq_query_dto_1.DlqQueryDto]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "getDlqEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific DLQ event by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DLQ Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the DLQ event' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "getDlqEvent", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually retry a DLQ event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DLQ Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retry initiated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "retryEvent", null);
__decorate([
    (0, common_1.Post)(':id/reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset the retry count for a DLQ event back to 0' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DLQ Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event reset successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "resetEvent", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a DLQ event (mark as manually resolved)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DLQ Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event archived successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "archiveEvent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a DLQ event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DLQ Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Event deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Post)('bulk/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry multiple DLQ events matching criteria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk retry initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dlq_query_dto_1.BulkRetryDto]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "bulkRetry", null);
__decorate([
    (0, common_1.Post)('bulk/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive multiple DLQ events matching criteria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk archive completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dlq_query_dto_1.BulkArchiveDto]),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "bulkArchive", null);
__decorate([
    (0, common_1.Delete)('bulk/archived'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all archived events (cleanup)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archived events deleted' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "bulkDeleteArchived", null);
__decorate([
    (0, common_1.Post)('alerts/check'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger DLQ health check and alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health check completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "triggerHealthCheck", null);
__decorate([
    (0, common_1.Post)('alerts/test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send a test alert to verify alert channels' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test alert sent' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DlqController.prototype, "sendTestAlert", null);
exports.DlqController = DlqController = __decorate([
    (0, swagger_1.ApiTags)('dlq'),
    (0, common_1.Controller)('dlq'),
    __metadata("design:paramtypes", [retry_service_1.RetryService,
        dlq_service_1.DlqService,
        dlq_alert_service_1.DlqAlertService])
], DlqController);
//# sourceMappingURL=dlq.controller.js.map