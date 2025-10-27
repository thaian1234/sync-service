/**
 * Data Transfer Objects (DTOs) for Kafka Events
 * Consolidates all domain entity data models used in CDC events
 */

import { IsNumber, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Product Entity DTO
 * Represents product data from CDC events
 */
export class ProductDto {
	@IsNumber()
	id: number;

	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsNumber()
	price: number;

	@IsNumber()
	stock: number;

	@IsOptional()
	@IsString()
	category?: string;

	@IsString()
	status: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	createdAt?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	updatedAt?: Date;
}

/**
 * Order Entity DTO
 * Represents order data from CDC events
 */
export class OrderDto {
	@IsNumber()
	id: number;

	@IsNumber()
	customerId: number;

	@IsNumber()
	total: number;

	@IsString()
	status: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	createdAt?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	updatedAt?: Date;
}

/**
 * Customer Entity DTO
 * Represents customer data from CDC events
 */
export class CustomerDto {
	@IsNumber()
	id: number;

	@IsString()
	name: string;

	@IsString()
	email: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	createdAt?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	updatedAt?: Date;
}

/**
 * Union type for all entity DTOs
 */
export type EntityDto = ProductDto | OrderDto | CustomerDto;

/**
 * DLQ Event Input DTO
 * Data structure for sending events to Dead Letter Queue
 */
export class DlqEventInputDto {
	@IsOptional()
	@IsString()
	eventId?: string;

	@IsString()
	tableName: string;

	@IsString()
	operation: string;

	payload: any;

	@IsString()
	errorMessage: string;

	@IsOptional()
	@IsNumber()
	maxRetries?: number;
}

/**
 * Debezium CDC Event DTO
 * Represents raw CDC event structure from Debezium
 * After ExtractNewRecordState transformation, the event looks like:
 * {
 *   id: number,
 *   ...other_fields,
 *   __op: 'c' | 'u' | 'd' | 'r',
 *   __source_ts_ms: number,
 *   __source_table: string
 * }
 */
export class DebeziumCdcEventDto {
	@IsString()
	__op: "c" | "u" | "d" | "r"; // create, update, delete, read (snapshot)

	@IsNumber()
	__source_ts_ms: number;

	@IsString()
	__source_table: string;

	[key: string]: any; // Actual data fields
}

/**
 * Base Domain Event Metadata
 */
export class EventMetadataDto {
	snapshot?: boolean;
	[key: string]: any;
}

/**
 * Base Domain Event DTO
 * Generic structure for all domain events
 */
export class BaseDomainEventDto<T> {
	eventId: string;
	type: string;
	source: string;
	timestamp: number;
	data: T;
	metadata?: EventMetadataDto;
}
