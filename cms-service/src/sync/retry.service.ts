import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, Between, LessThan } from "typeorm";
import { DlqEvent } from "../database/entities/dlq-event.entity";
import { DlqStatus } from "../kafka/enums";
import { SyncService } from "./sync.service";
import { DebeziumCdcTransformer } from "../kafka/transformers/debezium-cdc.transformer";
import { DlqService } from "../kafka/services/dlq.service";
import { DlqAlertService } from "../kafka/services/dlq-alert.service";
import { DlqQueryDto, BulkRetryDto, BulkArchiveDto } from "../dlq/dto/dlq-query.dto";

@Injectable()
export class RetryService {
	private readonly logger = new Logger(RetryService.name);

	constructor(
		@InjectRepository(DlqEvent)
		private dlqEventRepository: Repository<DlqEvent>,
		private syncService: SyncService,
		private cdcTransformer: DebeziumCdcTransformer,
		private dlqService: DlqService,
		private dataSource: DataSource,
		private dlqAlertService: DlqAlertService
	) {}

	/**
	 * Auto-retry failed events with exponential backoff
	 * Runs every 30 seconds
	 */
	@Cron(CronExpression.EVERY_10_SECONDS)
	async autoRetryFailedEvents() {
		this.logger.log("Running auto-retry for DLQ events...");

		let totalSuccessCount = 0;
		let totalFailedCount = 0;
		let totalAttempted = 0;
		const batchSize = 100;

		// Process all events in batches until none are left
		while (true) {
			const eventsToRetry = await this.dlqService.getEventsReadyForRetry(
				batchSize
			);

			if (eventsToRetry.length === 0) {
				break;
			}

			this.logger.log(
				`Processing batch of ${eventsToRetry.length} events (total so far: ${totalAttempted})`
			);

			let batchSuccessCount = 0;
			let batchFailedCount = 0;

			for (const event of eventsToRetry) {
				const success = await this.retryEvent(event.id);
				if (success) {
					batchSuccessCount++;
				} else {
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

			// If we got fewer events than the batch size, we're done
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
		} else {
			this.logger.debug("No events ready for retry");
		}

		// Check DLQ health and send alerts if needed (after retry run)
		try {
			await this.dlqAlertService.checkAndAlert();
		} catch (error) {
			this.logger.error("Failed to check DLQ alerts", error.stack);
		}
	}

	async retryEvent(dlqEventId: number): Promise<boolean> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const dlqEvent = await queryRunner.manager.findOneBy(DlqEvent, {
				id: dlqEventId,
			});

			if (!dlqEvent) {
				this.logger.warn(`DLQ event ${dlqEventId} not found`);
				await queryRunner.rollbackTransaction();
				return false;
			}

			if (dlqEvent.status !== DlqStatus.PENDING) {
				this.logger.debug(
					`DLQ event ${dlqEventId} is not in PENDING status (current: ${dlqEvent.status})`
				);
				await queryRunner.rollbackTransaction();
				return false;
			}

			if (dlqEvent.retryCount >= dlqEvent.maxRetries) {
				dlqEvent.status = DlqStatus.FAILED;
				dlqEvent.errorMessage = "Max retries exceeded";
				await queryRunner.manager.save(dlqEvent);
				await queryRunner.commitTransaction();
				return false;
			}

			// Mark as retrying
			dlqEvent.status = DlqStatus.RETRYING;
			await queryRunner.manager.save(dlqEvent);

			// Transform CDC event to domain event
			const domainEvent = this.cdcTransformer.transform(dlqEvent.payload);

			// Route to appropriate sync method based on table
			switch (dlqEvent.tableName) {
				case "customers":
					await this.syncService.syncCustomerEvent(
						domainEvent as any
					);
					break;
				case "products":
					await this.syncService.syncProductEvent(domainEvent as any);
					break;
				case "orders":
					await this.syncService.syncOrderEvent(domainEvent as any);
					break;
				default:
					throw new Error(`Unknown table: ${dlqEvent.tableName}`);
			}

			// Mark as successful
			dlqEvent.status = DlqStatus.SUCCESS;
			await queryRunner.manager.save(dlqEvent);

			await queryRunner.commitTransaction();

			this.logger.log(
				`Successfully retried DLQ event ${dlqEventId} (attempt ${
					dlqEvent.retryCount + 1
				})`
			);
			return true;
		} catch (error) {
			await queryRunner.rollbackTransaction();

			this.logger.error(
				`Retry failed for DLQ event ${dlqEventId}`,
				error.stack
			);

			// Increment retry count and update status (separate transaction)
			try {
				await this.dlqService.incrementRetryCount(
					dlqEventId,
					error.message
				);
			} catch (updateError) {
				this.logger.error(
					`Failed to update retry count for DLQ event ${dlqEventId}`,
					updateError.stack
				);
			}

			return false;
		} finally {
			await queryRunner.release();
		}
	}

	getDlqEvents(
		status: DlqStatus,
		page: number,
		limit: number
	): Promise<[DlqEvent[], number]> {
		return this.dlqEventRepository.findAndCount({
			where: { status },
			skip: (page - 1) * limit,
			take: limit,
		});
	}

	async resetEvent(dlqEventId: number): Promise<void> {
		const dlqEvent = await this.dlqEventRepository.findOneBy({
			id: dlqEventId,
		});
		if (dlqEvent) {
			dlqEvent.retryCount = 0;
			dlqEvent.status = DlqStatus.PENDING;
			await this.dlqEventRepository.save(dlqEvent);
		}
	}

	/**
	 * Get a specific DLQ event by ID
	 */
	async getDlqEventById(id: number): Promise<DlqEvent> {
		const event = await this.dlqEventRepository.findOneBy({ id });
		if (!event) {
			throw new NotFoundException(`DLQ event with ID ${id} not found`);
		}
		return event;
	}

	/**
	 * Advanced query for DLQ events with filtering
	 */
	async getDlqEventsAdvanced(
		query: DlqQueryDto
	): Promise<{ data: DlqEvent[]; total: number; page: number; limit: number }> {
		const { status, tableName, operation, page = 1, limit = 10, createdAfter, createdBefore } = query;

		const whereClause: any = {};

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
			whereClause.createdAt = Between(new Date(createdAfter), new Date(createdBefore));
		} else if (createdAfter) {
			whereClause.createdAt = Between(new Date(createdAfter), new Date());
		} else if (createdBefore) {
			whereClause.createdAt = LessThan(new Date(createdBefore));
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

	/**
	 * Archive a DLQ event (mark as manually resolved)
	 */
	async archiveEvent(id: number): Promise<void> {
		const event = await this.getDlqEventById(id);
		event.status = DlqStatus.ARCHIVED;
		await this.dlqEventRepository.save(event);
		this.logger.log(`DLQ event ${id} archived`);
	}

	/**
	 * Delete a DLQ event permanently
	 */
	async deleteEvent(id: number): Promise<void> {
		const event = await this.getDlqEventById(id);
		await this.dlqEventRepository.remove(event);
		this.logger.log(`DLQ event ${id} deleted permanently`);
	}

	/**
	 * Bulk retry events matching criteria
	 */
	async bulkRetry(dto: BulkRetryDto): Promise<{ count: number; successCount: number; failedCount: number }> {
		const { status, tableName, limit = 100 } = dto;

		const whereClause: any = {};
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
			} else {
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

	/**
	 * Bulk archive events matching criteria
	 */
	async bulkArchive(dto: BulkArchiveDto): Promise<number> {
		const { olderThan, status } = dto;

		const whereClause: any = {};
		if (status) {
			whereClause.status = status;
		}
		if (olderThan) {
			whereClause.createdAt = LessThan(new Date(olderThan));
		}

		const result = await this.dlqEventRepository.update(whereClause, {
			status: DlqStatus.ARCHIVED,
		});

		const count = result.affected || 0;
		this.logger.log(`Bulk archived ${count} events`);
		return count;
	}

	/**
	 * Delete all archived events (cleanup)
	 */
	async deleteArchivedEvents(): Promise<number> {
		const result = await this.dlqEventRepository.delete({
			status: DlqStatus.ARCHIVED,
		});

		const count = result.affected || 0;
		this.logger.log(`Deleted ${count} archived events`);
		return count;
	}
}
