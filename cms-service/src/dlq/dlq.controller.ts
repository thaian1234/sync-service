import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RetryService } from '../sync/retry.service';
import { DlqService } from '../kafka/services/dlq.service';
import { DlqAlertService } from '../kafka/services/dlq-alert.service';
import { DlqStatus, AlertSeverity } from '../kafka/enums';
import { DlqQueryDto, BulkRetryDto, BulkArchiveDto } from './dto/dlq-query.dto';

@ApiTags('dlq')
@Controller('dlq')
export class DlqController {
  constructor(
    private readonly retryService: RetryService,
    private readonly dlqService: DlqService,
    private readonly dlqAlertService: DlqAlertService,
  ) {}

  /**
   * Get DLQ statistics dashboard
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get DLQ statistics and health metrics' })
  @ApiResponse({ status: 200, description: 'Returns DLQ statistics' })
  async getStats() {
    const stats = await this.dlqService.getStats();
    const health = {
      status: stats.failed > 10 ? 'unhealthy' : stats.pending > 100 ? 'degraded' : 'healthy',
      ...stats,
    };
    return health;
  }

  /**
   * List DLQ events with advanced filtering
   */
  @Get()
  @ApiOperation({ summary: 'List all DLQ events with advanced filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated DLQ events' })
  async getDlqEvents(@Query() query: DlqQueryDto) {
    return this.retryService.getDlqEventsAdvanced(query);
  }

  /**
   * Get specific DLQ event by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific DLQ event by ID' })
  @ApiParam({ name: 'id', description: 'DLQ Event ID' })
  @ApiResponse({ status: 200, description: 'Returns the DLQ event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getDlqEvent(@Param('id', ParseIntPipe) id: number) {
    return this.retryService.getDlqEventById(id);
  }

  /**
   * Manually retry a single DLQ event
   */
  @Post(':id/retry')
  @ApiOperation({ summary: 'Manually retry a DLQ event' })
  @ApiParam({ name: 'id', description: 'DLQ Event ID' })
  @ApiResponse({ status: 200, description: 'Retry initiated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async retryEvent(@Param('id', ParseIntPipe) id: number) {
    const success = await this.retryService.retryEvent(id);
    return {
      success,
      message: success ? 'Event retried successfully' : 'Event retry failed',
      eventId: id,
    };
  }

  /**
   * Reset retry count for a DLQ event
   */
  @Post(':id/reset')
  @ApiOperation({ summary: 'Reset the retry count for a DLQ event back to 0' })
  @ApiParam({ name: 'id', description: 'DLQ Event ID' })
  @ApiResponse({ status: 200, description: 'Event reset successfully' })
  async resetEvent(@Param('id', ParseIntPipe) id: number) {
    await this.retryService.resetEvent(id);
    return {
      success: true,
      message: 'Event retry count reset successfully',
      eventId: id,
    };
  }

  /**
   * Archive a DLQ event (mark as resolved)
   */
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a DLQ event (mark as manually resolved)' })
  @ApiParam({ name: 'id', description: 'DLQ Event ID' })
  @ApiResponse({ status: 200, description: 'Event archived successfully' })
  async archiveEvent(@Param('id', ParseIntPipe) id: number) {
    await this.retryService.archiveEvent(id);
    return {
      success: true,
      message: 'Event archived successfully',
      eventId: id,
    };
  }

  /**
   * Delete a DLQ event permanently
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a DLQ event' })
  @ApiParam({ name: 'id', description: 'DLQ Event ID' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    await this.retryService.deleteEvent(id);
  }

  /**
   * Bulk retry multiple events
   */
  @Post('bulk/retry')
  @ApiOperation({ summary: 'Retry multiple DLQ events matching criteria' })
  @ApiResponse({ status: 200, description: 'Bulk retry initiated' })
  async bulkRetry(@Body() dto: BulkRetryDto) {
    const result = await this.retryService.bulkRetry(dto);
    return {
      success: true,
      message: `Initiated retry for ${result.count} events`,
      ...result,
    };
  }

  /**
   * Bulk archive events
   */
  @Post('bulk/archive')
  @ApiOperation({ summary: 'Archive multiple DLQ events matching criteria' })
  @ApiResponse({ status: 200, description: 'Bulk archive completed' })
  async bulkArchive(@Body() dto: BulkArchiveDto) {
    const count = await this.retryService.bulkArchive(dto);
    return {
      success: true,
      message: `Archived ${count} events`,
      count,
    };
  }

  /**
   * Bulk delete archived events
   */
  @Delete('bulk/archived')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all archived events (cleanup)' })
  @ApiResponse({ status: 200, description: 'Archived events deleted' })
  async bulkDeleteArchived() {
    const count = await this.retryService.deleteArchivedEvents();
    return {
      success: true,
      message: `Deleted ${count} archived events`,
      count,
    };
  }

  /**
   * Trigger manual health check and alerting
   */
  @Post('alerts/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger DLQ health check and alerts' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async triggerHealthCheck() {
    await this.dlqAlertService.checkAndAlert();
    return {
      success: true,
      message: 'Health check completed, alerts sent if thresholds exceeded',
    };
  }

  /**
   * Send test alert
   */
  @Post('alerts/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test alert to verify alert channels' })
  @ApiResponse({ status: 200, description: 'Test alert sent' })
  async sendTestAlert() {
    await this.dlqAlertService.sendCustomAlert(
      AlertSeverity.INFO,
      'DLQ Alert System Test',
      'This is a test alert to verify that the DLQ alerting system is working correctly.',
      { test: true, timestamp: new Date().toISOString() },
    );
    return {
      success: true,
      message: 'Test alert sent to all configured channels',
    };
  }
}
