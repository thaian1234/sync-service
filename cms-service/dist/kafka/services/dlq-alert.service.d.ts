import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
import { AlertSeverity } from '../enums';
export interface AlertChannel {
    sendAlert(alert: DlqAlert): Promise<void>;
}
export interface DlqAlert {
    severity: AlertSeverity;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export declare class EmailAlertChannel implements AlertChannel {
    private readonly logger;
    sendAlert(alert: DlqAlert): Promise<void>;
}
export declare class SlackAlertChannel implements AlertChannel {
    private readonly logger;
    sendAlert(alert: DlqAlert): Promise<void>;
}
export declare class WebhookAlertChannel implements AlertChannel {
    private readonly logger;
    sendAlert(alert: DlqAlert): Promise<void>;
}
export declare class DlqAlertService {
    private dlqEventRepository;
    private emailChannel;
    private slackChannel;
    private webhookChannel;
    private readonly logger;
    private lastAlertTime;
    private alertChannels;
    constructor(dlqEventRepository: Repository<DlqEvent>, emailChannel: EmailAlertChannel, slackChannel: SlackAlertChannel, webhookChannel: WebhookAlertChannel);
    private shouldSendAlert;
    private sendAlert;
    checkAndAlert(): Promise<void>;
    alertCriticalEvent(eventId: number, reason: string): Promise<void>;
    sendCustomAlert(severity: AlertSeverity, title: string, message: string, metadata?: Record<string, any>): Promise<void>;
}
