import { Injectable, Logger } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";
import { BaseDomainEvent } from "../events/base-domain.event";
import { CustomerChangedEvent } from "../events/customer-changed.event";
import { ProductChangedEvent } from "../events/product-changed.event";
import { OrderChangedEvent } from "../events/order-changed.event";
import {
	CustomerDto,
	ProductDto,
	OrderDto,
	DebeziumCdcEventDto,
} from "../dto/domain-event.dto";
import {
	CDC_TABLE_NAMES,
	ERROR_MESSAGES,
	CDC_TO_EVENT_TYPE,
	EventType,
} from "../enums";

@Injectable()
export class DebeziumCdcTransformer {
	private readonly logger = new Logger(DebeziumCdcTransformer.name);

	/**
	 * Map of table names to their transformation handlers
	 */
	private readonly tableTransformers = new Map<
		string,
		(cdcEvent: DebeziumCdcEventDto) => any
	>([
		[
			CDC_TABLE_NAMES.CUSTOMERS,
			(event: DebeziumCdcEventDto) => this.transformCustomerEvent(event),
		],
		[
			CDC_TABLE_NAMES.PRODUCTS,
			(event: DebeziumCdcEventDto) => this.transformProductEvent(event),
		],
		[
			CDC_TABLE_NAMES.ORDERS,
			(event: DebeziumCdcEventDto) => this.transformOrderEvent(event),
		],
	]);

	/**
	 * Transform Debezium CDC event to domain event based on source table
	 */
	transform(cdcEvent: DebeziumCdcEventDto): BaseDomainEvent<any> {
		const table = cdcEvent.__source_table;

		try {
			// Validate CDC event using DTO
			const validatedEvent = plainToClass(DebeziumCdcEventDto, cdcEvent);
			const errors = validateSync(validatedEvent, {
				skipMissingProperties: true,
			});
			if (errors.length > 0) {
				const errorMessages = errors
					.map(
						(err) =>
							`${err.property}: ${Object.values(
								err.constraints || {}
							).join(", ")}`
					)
					.join("; ");
				throw new Error(
					`CDC event validation failed: ${errorMessages}`
				);
			}

			const transformer = this.tableTransformers.get(table);
			if (!transformer) {
				throw new Error(
					ERROR_MESSAGES.UNKNOWN_SOURCE_TABLE.replace(
						"{table}",
						table
					)
				);
			}
			return transformer(cdcEvent) as any;
		} catch (error) {
			this.logger.error(
				`Failed to transform CDC event from table ${table}`,
				error
			);
			throw error;
		}
	}

	private transformCustomerEvent(
		cdcEvent: DebeziumCdcEventDto
	): CustomerChangedEvent {
		const eventType = this.mapOperationToEventType(cdcEvent.__op);
		const customerData = plainToClass(CustomerDto, {
			id: cdcEvent.id,
			name: cdcEvent.name,
			email: cdcEvent.email,
			phone: cdcEvent.phone,
			createdAt: cdcEvent.created_at
				? new Date(cdcEvent.created_at / 1000)
				: undefined,
			updatedAt: cdcEvent.updated_at
				? new Date(cdcEvent.updated_at / 1000)
				: undefined,
		});

		// Validate customer data
		const errors = validateSync(customerData, {
			skipMissingProperties: true,
		});
		if (errors.length > 0) {
			const errorMessages = errors
				.map(
					(err) =>
						`${err.property}: ${Object.values(
							err.constraints || {}
						).join(", ")}`
				)
				.join("; ");
			throw new Error(
				`Customer data validation failed: ${errorMessages}`
			);
		}

		return new CustomerChangedEvent({
			eventId: CustomerChangedEvent.generateEventId(
				cdcEvent.id,
				cdcEvent.__op,
				cdcEvent.__source_ts_ms
			),
			type: eventType,
			source: cdcEvent.__source_table,
			timestamp: cdcEvent.__source_ts_ms,
			data: customerData,
			metadata: {
				snapshot: cdcEvent.__op === "r",
			},
		});
	}

	private transformProductEvent(
		cdcEvent: DebeziumCdcEventDto
	): ProductChangedEvent {
		const eventType = this.mapOperationToEventType(cdcEvent.__op);
		const productData = plainToClass(ProductDto, {
			id: cdcEvent.id,
			name: cdcEvent.name,
			description: cdcEvent.description,
			price: parseFloat(cdcEvent.price),
			stock: cdcEvent.stock,
			category: cdcEvent.category,
			status: cdcEvent.status,
			createdAt: cdcEvent.created_at
				? new Date(cdcEvent.created_at / 1000)
				: undefined,
			updatedAt: cdcEvent.updated_at
				? new Date(cdcEvent.updated_at / 1000)
				: undefined,
		});
		// throw new Error("Product data validation failed");

		// Validate product data
		const errors = validateSync(productData, {
			skipMissingProperties: true,
		});
		if (errors.length > 0) {
			const errorMessages = errors
				.map(
					(err) =>
						`${err.property}: ${Object.values(
							err.constraints || {}
						).join(", ")}`
				)
				.join("; ");
			throw new Error(`Product data validation failed: ${errorMessages}`);
		}

		return new ProductChangedEvent({
			eventId: ProductChangedEvent.generateEventId(
				cdcEvent.id,
				cdcEvent.__op,
				cdcEvent.__source_ts_ms
			),
			type: eventType,
			source: cdcEvent.__source_table,
			timestamp: cdcEvent.__source_ts_ms,
			data: productData,
			metadata: {
				snapshot: cdcEvent.__op === "r",
			},
		});
	}

	private transformOrderEvent(
		cdcEvent: DebeziumCdcEventDto
	): OrderChangedEvent {
		const eventType = this.mapOperationToEventType(cdcEvent.__op);
		const orderData = plainToClass(OrderDto, {
			id: cdcEvent.id,
			customerId: cdcEvent.customer_id,
			total: parseFloat(cdcEvent.total),
			status: cdcEvent.status,
			createdAt: cdcEvent.created_at
				? new Date(cdcEvent.created_at / 1000)
				: undefined,
			updatedAt: cdcEvent.updated_at
				? new Date(cdcEvent.updated_at / 1000)
				: undefined,
		});

		// Validate order data
		const errors = validateSync(orderData, { skipMissingProperties: true });
		if (errors.length > 0) {
			const errorMessages = errors
				.map(
					(err) =>
						`${err.property}: ${Object.values(
							err.constraints || {}
						).join(", ")}`
				)
				.join("; ");
			throw new Error(`Order data validation failed: ${errorMessages}`);
		}

		return new OrderChangedEvent({
			eventId: OrderChangedEvent.generateEventId(
				cdcEvent.id,
				cdcEvent.__op,
				cdcEvent.__source_ts_ms
			),
			type: eventType,
			source: cdcEvent.__source_table,
			timestamp: cdcEvent.__source_ts_ms,
			data: orderData,
			metadata: {
				snapshot: cdcEvent.__op === "r",
			},
		});
	}

	/**
	 * Map Debezium operation codes to domain event types
	 */
	private mapOperationToEventType(op: string): EventType {
		const eventType =
			CDC_TO_EVENT_TYPE[op as keyof typeof CDC_TO_EVENT_TYPE];
		if (!eventType) {
			throw new Error(
				ERROR_MESSAGES.UNKNOWN_CDC_OPERATION.replace("{op}", op)
			);
		}
		return eventType;
	}

	/**
	 * Validate that the CDC event has required fields
	 */
	validateCdcEvent(event: any): event is DebeziumCdcEventDto {
		return (
			event &&
			typeof event === "object" &&
			"__op" in event &&
			"__source_ts_ms" in event &&
			"__source_table" in event &&
			"id" in event
		);
	}
}
