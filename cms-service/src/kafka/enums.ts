/**
 * Domain Event Types and CDC Operation Codes
 * Maps CDC operation codes to domain event types:
 * 'c' (create) → CREATED
 * 'u' (update) → UPDATED
 * 'd' (delete) → DELETED
 * 'r' (read snapshot) → SNAPSHOT
 */
export const EVENT_TYPE = {
	CREATED: "CREATED",
	UPDATED: "UPDATED",
	DELETED: "DELETED",
	SNAPSHOT: "SNAPSHOT",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

/**
 * CDC Operation Codes from Debezium
 */
export const CDC_OPERATION = {
	CREATE: "c",
	UPDATE: "u",
	DELETE: "d",
	READ: "r",
} as const;

export type CdcOperation = (typeof CDC_OPERATION)[keyof typeof CDC_OPERATION];

/**
 * Mapping from CDC operation codes to event types
 */
export const CDC_TO_EVENT_TYPE: Record<CdcOperation, EventType> = {
	[CDC_OPERATION.CREATE]: EVENT_TYPE.CREATED,
	[CDC_OPERATION.UPDATE]: EVENT_TYPE.UPDATED,
	[CDC_OPERATION.DELETE]: EVENT_TYPE.DELETED,
	[CDC_OPERATION.READ]: EVENT_TYPE.SNAPSHOT,
};

/**
 * Dead Letter Queue Event Status
 */
export enum DlqStatus {
	PENDING = "PENDING",
	RETRYING = "RETRYING",
	FAILED = "FAILED",
	SUCCESS = "SUCCESS",
	ARCHIVED = "ARCHIVED", // For events that have been manually resolved
}

/**
 * DLQ Event Priority (for future implementation)
 */
export enum DlqPriority {
	LOW = "LOW",
	NORMAL = "NORMAL",
	HIGH = "HIGH",
	CRITICAL = "CRITICAL",
}

/**
 * Alert Severity Levels
 */
export enum AlertSeverity {
	INFO = "INFO",
	WARNING = "WARNING",
	ERROR = "ERROR",
	CRITICAL = "CRITICAL",
}

/**
 * Kafka Topic Names
 */
export const KAFKA_TOPICS = {
	CUSTOMERS: "customers.events",
	PRODUCTS: "products.events",
	ORDERS: "orders.events",
} as const;

/**
 * Table Names for CDC Events
 */
export const CDC_TABLE_NAMES = {
	CUSTOMERS: "customers",
	PRODUCTS: "products",
	ORDERS: "orders",
} as const;

/**
 * Kafka Configuration Constants
 */
export const KAFKA_CONFIG = {
	// Client configuration
	CLIENT: {
		INITIAL_RETRY_TIME: 100,
		RETRIES: 5,
		MAX_RETRY_TIME: 10000,
		CONNECTION_TIMEOUT: 5000,
		REQUEST_TIMEOUT: 20000,
	},
	// Consumer configuration
	CONSUMER: {
		SESSION_TIMEOUT: 30000,
		HEARTBEAT_INTERVAL: 3000,
		AUTO_COMMIT_INTERVAL: 5000,
		PARTITIONS_CONSUMED_CONCURRENTLY: 5,
		HEALTH_CHECK_SESSION_TIMEOUT: 60000,
	},
	// Producer configuration
	PRODUCER: {
		INITIAL_RETRY_TIME: 100,
		RETRIES: 3,
		MAX_RETRY_TIME: 5000,
		HEALTH_CHECK_INITIAL_RETRY_TIME: 300,
		HEALTH_CHECK_RETRIES: 5,
		HEALTH_CHECK_MAX_RETRY_TIME: 30000,
	},
	// Health check configuration
	HEALTH_CHECK: {
		TIMEOUT: 5000,
		CONFIG_INITIAL_RETRY_TIME: 300,
		CONFIG_RETRIES: 5,
		CONFIG_MAX_RETRY_TIME: 30000,
	},
} as const;

/**
 * DLQ Service Configuration Constants
 */
export const DLQ_CONFIG = {
	BASE_DELAY_MS: 1000,
	MAX_DELAY_MS: 300000, // 5 minutes
	JITTER_FACTOR: 0.3,
	DEFAULT_FETCH_LIMIT: 100,
	FETCH_MULTIPLIER: 2,
	DEFAULT_MAX_RETRIES: 5,
	// Alert thresholds
	ALERT_THRESHOLD_PENDING: 100, // Alert when >100 pending events
	ALERT_THRESHOLD_FAILED: 10, // Alert when >10 permanently failed events
	ALERT_INTERVAL_MS: 300000, // Alert every 5 minutes max
} as const;

/**
 * Error Detection Patterns
 */
export const ERROR_PATTERNS = {
	RETRYABLE: {
		CONNECTION_REFUSED: "ECONNREFUSED",
		TIMEOUT: "ETIMEDOUT",
		NOT_FOUND: "ENOTFOUND",
		CONNECTION_LOST: "Connection lost",
	},
	NON_RETRYABLE: {
		DUPLICATE_ENTRY: "Duplicate entry",
		UNIQUE_CONSTRAINT: "unique constraint",
		VALIDATION_FAILED: "Validation failed",
		INVALID_DATA: "Invalid data",
	},
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
	INVALID_CDC_EVENT_STRUCTURE: "Invalid CDC event structure",
	UNKNOWN_SOURCE_TABLE: "Unknown source table: {table}",
	UNKNOWN_CDC_OPERATION: "Unknown CDC operation: {op}",
} as const;
