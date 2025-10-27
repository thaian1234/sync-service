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
var EmailAlertChannel_1, SlackAlertChannel_1, WebhookAlertChannel_1, DlqAlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqAlertService = exports.WebhookAlertChannel = exports.SlackAlertChannel = exports.EmailAlertChannel = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dlq_event_entity_1 = require("../../database/entities/dlq-event.entity");
const enums_1 = require("../enums");
let EmailAlertChannel = EmailAlertChannel_1 = class EmailAlertChannel {
    constructor() {
        this.logger = new common_1.Logger(EmailAlertChannel_1.name);
    }
    async sendAlert(alert) {
        this.logger.warn({
            message: 'Email alert would be sent',
            alert,
        });
    }
};
exports.EmailAlertChannel = EmailAlertChannel;
exports.EmailAlertChannel = EmailAlertChannel = EmailAlertChannel_1 = __decorate([
    (0, common_1.Injectable)()
], EmailAlertChannel);
let SlackAlertChannel = SlackAlertChannel_1 = class SlackAlertChannel {
    constructor() {
        this.logger = new common_1.Logger(SlackAlertChannel_1.name);
    }
    async sendAlert(alert) {
        this.logger.warn({
            message: 'Slack alert would be sent',
            alert,
        });
    }
};
exports.SlackAlertChannel = SlackAlertChannel;
exports.SlackAlertChannel = SlackAlertChannel = SlackAlertChannel_1 = __decorate([
    (0, common_1.Injectable)()
], SlackAlertChannel);
let WebhookAlertChannel = WebhookAlertChannel_1 = class WebhookAlertChannel {
    constructor() {
        this.logger = new common_1.Logger(WebhookAlertChannel_1.name);
    }
    async sendAlert(alert) {
        const webhookUrl = process.env.DLQ_WEBHOOK_URL;
        if (!webhookUrl) {
            this.logger.debug('No webhook URL configured, skipping webhook alert');
            return;
        }
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Alert-Severity': alert.severity,
                },
                body: JSON.stringify(alert),
            });
            if (!response.ok) {
                throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
            }
            this.logger.log(`Alert sent to webhook: ${alert.title}`);
        }
        catch (error) {
            this.logger.error('Failed to send webhook alert', error.stack);
        }
    }
};
exports.WebhookAlertChannel = WebhookAlertChannel;
exports.WebhookAlertChannel = WebhookAlertChannel = WebhookAlertChannel_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookAlertChannel);
let DlqAlertService = DlqAlertService_1 = class DlqAlertService {
    constructor(dlqEventRepository, emailChannel, slackChannel, webhookChannel) {
        this.dlqEventRepository = dlqEventRepository;
        this.emailChannel = emailChannel;
        this.slackChannel = slackChannel;
        this.webhookChannel = webhookChannel;
        this.logger = new common_1.Logger(DlqAlertService_1.name);
        this.lastAlertTime = null;
        this.alertChannels = [];
        if (process.env.ENABLE_EMAIL_ALERTS === 'true') {
            this.alertChannels.push(this.emailChannel);
        }
        if (process.env.ENABLE_SLACK_ALERTS === 'true') {
            this.alertChannels.push(this.slackChannel);
        }
        if (process.env.DLQ_WEBHOOK_URL) {
            this.alertChannels.push(this.webhookChannel);
        }
    }
    shouldSendAlert() {
        if (!this.lastAlertTime) {
            return true;
        }
        const timeSinceLastAlert = Date.now() - this.lastAlertTime.getTime();
        return timeSinceLastAlert >= enums_1.DLQ_CONFIG.ALERT_INTERVAL_MS;
    }
    async sendAlert(alert) {
        if (!this.shouldSendAlert()) {
            this.logger.debug('Skipping alert due to rate limiting');
            return;
        }
        this.logger.warn({
            message: 'Sending DLQ alert',
            severity: alert.severity,
            title: alert.title,
        });
        await Promise.allSettled(this.alertChannels.map((channel) => channel.sendAlert(alert)));
        this.lastAlertTime = new Date();
    }
    async checkAndAlert() {
        const [pendingCount, failedCount, retryingCount] = await Promise.all([
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.PENDING } }),
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.FAILED } }),
            this.dlqEventRepository.count({ where: { status: enums_1.DlqStatus.RETRYING } }),
        ]);
        if (pendingCount >= enums_1.DLQ_CONFIG.ALERT_THRESHOLD_PENDING) {
            await this.sendAlert({
                severity: enums_1.AlertSeverity.WARNING,
                title: 'High DLQ Pending Event Count',
                message: `There are ${pendingCount} events pending retry in the Dead Letter Queue. This may indicate downstream system issues or processing delays.`,
                metadata: {
                    pendingCount,
                    failedCount,
                    retryingCount,
                    threshold: enums_1.DLQ_CONFIG.ALERT_THRESHOLD_PENDING,
                },
                timestamp: new Date(),
            });
        }
        if (failedCount >= enums_1.DLQ_CONFIG.ALERT_THRESHOLD_FAILED) {
            await this.sendAlert({
                severity: enums_1.AlertSeverity.ERROR,
                title: 'DLQ Events Permanently Failed',
                message: `${failedCount} events have permanently failed after exhausting all retries. Manual intervention is required.`,
                metadata: {
                    pendingCount,
                    failedCount,
                    retryingCount,
                    threshold: enums_1.DLQ_CONFIG.ALERT_THRESHOLD_FAILED,
                    actionRequired: 'Review failed events in the DLQ admin panel',
                },
                timestamp: new Date(),
            });
        }
    }
    async alertCriticalEvent(eventId, reason) {
        const event = await this.dlqEventRepository.findOne({
            where: { id: eventId },
        });
        if (!event) {
            return;
        }
        await this.sendAlert({
            severity: enums_1.AlertSeverity.CRITICAL,
            title: 'Critical DLQ Event Requires Attention',
            message: `Event ${eventId} (${event.tableName}.${event.operation}) has failed critically: ${reason}`,
            metadata: {
                eventId,
                tableName: event.tableName,
                operation: event.operation,
                retryCount: event.retryCount,
                errorMessage: event.errorMessage,
                reason,
            },
            timestamp: new Date(),
        });
    }
    async sendCustomAlert(severity, title, message, metadata) {
        await this.sendAlert({
            severity,
            title,
            message,
            metadata,
            timestamp: new Date(),
        });
    }
};
exports.DlqAlertService = DlqAlertService;
exports.DlqAlertService = DlqAlertService = DlqAlertService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dlq_event_entity_1.DlqEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        EmailAlertChannel,
        SlackAlertChannel,
        WebhookAlertChannel])
], DlqAlertService);
//# sourceMappingURL=dlq-alert.service.js.map