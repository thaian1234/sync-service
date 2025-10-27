import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
import { AlertSeverity, DlqStatus, DLQ_CONFIG } from '../enums';

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

/**
 * Email Alert Channel (example implementation)
 */
@Injectable()
export class EmailAlertChannel implements AlertChannel {
  private readonly logger = new Logger(EmailAlertChannel.name);

  async sendAlert(alert: DlqAlert): Promise<void> {
    // TODO: Implement actual email sending (using @nestjs-modules/mailer or similar)
    this.logger.warn({
      message: 'Email alert would be sent',
      alert,
    });

    // Example implementation:
    // await this.mailerService.sendMail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `[${alert.severity}] ${alert.title}`,
    //   template: 'dlq-alert',
    //   context: {
    //     severity: alert.severity,
    //     title: alert.title,
    //     message: alert.message,
    //     metadata: alert.metadata,
    //     timestamp: alert.timestamp,
    //   },
    // });
  }
}

/**
 * Slack Alert Channel (example implementation)
 */
@Injectable()
export class SlackAlertChannel implements AlertChannel {
  private readonly logger = new Logger(SlackAlertChannel.name);

  async sendAlert(alert: DlqAlert): Promise<void> {
    // TODO: Implement Slack webhook integration
    this.logger.warn({
      message: 'Slack alert would be sent',
      alert,
    });

    // Example implementation:
    // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    // if (!webhookUrl) return;
    //
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `*[${alert.severity}] ${alert.title}*`,
    //     blocks: [
    //       {
    //         type: 'section',
    //         text: {
    //           type: 'mrkdwn',
    //           text: `*[${alert.severity}] ${alert.title}*\n${alert.message}`,
    //         },
    //       },
    //       {
    //         type: 'context',
    //         elements: [
    //           {
    //             type: 'mrkdwn',
    //             text: `Timestamp: ${alert.timestamp.toISOString()}`,
    //           },
    //         ],
    //       },
    //     ],
    //   }),
    // });
  }
}

/**
 * Webhook Alert Channel (generic webhook implementation)
 */
@Injectable()
export class WebhookAlertChannel implements AlertChannel {
  private readonly logger = new Logger(WebhookAlertChannel.name);

  async sendAlert(alert: DlqAlert): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to send webhook alert', error.stack);
    }
  }
}

/**
 * DLQ Alert Service - Manages alerting for DLQ events
 */
@Injectable()
export class DlqAlertService {
  private readonly logger = new Logger(DlqAlertService.name);
  private lastAlertTime: Date | null = null;
  private alertChannels: AlertChannel[] = [];

  constructor(
    @InjectRepository(DlqEvent)
    private dlqEventRepository: Repository<DlqEvent>,
    private emailChannel: EmailAlertChannel,
    private slackChannel: SlackAlertChannel,
    private webhookChannel: WebhookAlertChannel,
  ) {
    // Register alert channels based on environment configuration
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

  /**
   * Check if we should send an alert (rate limiting)
   */
  private shouldSendAlert(): boolean {
    if (!this.lastAlertTime) {
      return true;
    }

    const timeSinceLastAlert = Date.now() - this.lastAlertTime.getTime();
    return timeSinceLastAlert >= DLQ_CONFIG.ALERT_INTERVAL_MS;
  }

  /**
   * Send alert to all configured channels
   */
  private async sendAlert(alert: DlqAlert): Promise<void> {
    if (!this.shouldSendAlert()) {
      this.logger.debug('Skipping alert due to rate limiting');
      return;
    }

    this.logger.warn({
      message: 'Sending DLQ alert',
      severity: alert.severity,
      title: alert.title,
    });

    // Send to all channels in parallel
    await Promise.allSettled(
      this.alertChannels.map((channel) => channel.sendAlert(alert)),
    );

    this.lastAlertTime = new Date();
  }

  /**
   * Check DLQ health and send alerts if needed
   */
  async checkAndAlert(): Promise<void> {
    const [pendingCount, failedCount, retryingCount] = await Promise.all([
      this.dlqEventRepository.count({ where: { status: DlqStatus.PENDING } }),
      this.dlqEventRepository.count({ where: { status: DlqStatus.FAILED } }),
      this.dlqEventRepository.count({ where: { status: DlqStatus.RETRYING } }),
    ]);

    // Alert on high pending count
    if (pendingCount >= DLQ_CONFIG.ALERT_THRESHOLD_PENDING) {
      await this.sendAlert({
        severity: AlertSeverity.WARNING,
        title: 'High DLQ Pending Event Count',
        message: `There are ${pendingCount} events pending retry in the Dead Letter Queue. This may indicate downstream system issues or processing delays.`,
        metadata: {
          pendingCount,
          failedCount,
          retryingCount,
          threshold: DLQ_CONFIG.ALERT_THRESHOLD_PENDING,
        },
        timestamp: new Date(),
      });
    }

    // Alert on failed events
    if (failedCount >= DLQ_CONFIG.ALERT_THRESHOLD_FAILED) {
      await this.sendAlert({
        severity: AlertSeverity.ERROR,
        title: 'DLQ Events Permanently Failed',
        message: `${failedCount} events have permanently failed after exhausting all retries. Manual intervention is required.`,
        metadata: {
          pendingCount,
          failedCount,
          retryingCount,
          threshold: DLQ_CONFIG.ALERT_THRESHOLD_FAILED,
          actionRequired: 'Review failed events in the DLQ admin panel',
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Send alert for a specific critical event
   */
  async alertCriticalEvent(eventId: number, reason: string): Promise<void> {
    const event = await this.dlqEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      return;
    }

    await this.sendAlert({
      severity: AlertSeverity.CRITICAL,
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

  /**
   * Send custom alert
   */
  async sendCustomAlert(
    severity: AlertSeverity,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.sendAlert({
      severity,
      title,
      message,
      metadata,
      timestamp: new Date(),
    });
  }
}
