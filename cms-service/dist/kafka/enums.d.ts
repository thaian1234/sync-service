export declare const EVENT_TYPE: {
    readonly CREATED: "CREATED";
    readonly UPDATED: "UPDATED";
    readonly DELETED: "DELETED";
    readonly SNAPSHOT: "SNAPSHOT";
};
export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
export declare const CDC_OPERATION: {
    readonly CREATE: "c";
    readonly UPDATE: "u";
    readonly DELETE: "d";
    readonly READ: "r";
};
export type CdcOperation = (typeof CDC_OPERATION)[keyof typeof CDC_OPERATION];
export declare const CDC_TO_EVENT_TYPE: Record<CdcOperation, EventType>;
export declare enum DlqStatus {
    PENDING = "PENDING",
    RETRYING = "RETRYING",
    FAILED = "FAILED",
    SUCCESS = "SUCCESS",
    ARCHIVED = "ARCHIVED"
}
export declare enum DlqPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum AlertSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL"
}
export declare const KAFKA_TOPICS: {
    readonly CUSTOMERS: "customers.events";
    readonly PRODUCTS: "products.events";
    readonly ORDERS: "orders.events";
};
export declare const CDC_TABLE_NAMES: {
    readonly CUSTOMERS: "customers";
    readonly PRODUCTS: "products";
    readonly ORDERS: "orders";
};
export declare const KAFKA_CONFIG: {
    readonly CLIENT: {
        readonly INITIAL_RETRY_TIME: 100;
        readonly RETRIES: 5;
        readonly MAX_RETRY_TIME: 10000;
        readonly CONNECTION_TIMEOUT: 5000;
        readonly REQUEST_TIMEOUT: 20000;
    };
    readonly CONSUMER: {
        readonly SESSION_TIMEOUT: 30000;
        readonly HEARTBEAT_INTERVAL: 3000;
        readonly AUTO_COMMIT_INTERVAL: 5000;
        readonly PARTITIONS_CONSUMED_CONCURRENTLY: 5;
        readonly HEALTH_CHECK_SESSION_TIMEOUT: 60000;
    };
    readonly PRODUCER: {
        readonly INITIAL_RETRY_TIME: 100;
        readonly RETRIES: 3;
        readonly MAX_RETRY_TIME: 5000;
        readonly HEALTH_CHECK_INITIAL_RETRY_TIME: 300;
        readonly HEALTH_CHECK_RETRIES: 5;
        readonly HEALTH_CHECK_MAX_RETRY_TIME: 30000;
    };
    readonly HEALTH_CHECK: {
        readonly TIMEOUT: 5000;
        readonly CONFIG_INITIAL_RETRY_TIME: 300;
        readonly CONFIG_RETRIES: 5;
        readonly CONFIG_MAX_RETRY_TIME: 30000;
    };
};
export declare const DLQ_CONFIG: {
    readonly BASE_DELAY_MS: 1000;
    readonly MAX_DELAY_MS: 300000;
    readonly JITTER_FACTOR: 0.3;
    readonly DEFAULT_FETCH_LIMIT: 100;
    readonly FETCH_MULTIPLIER: 2;
    readonly DEFAULT_MAX_RETRIES: 5;
    readonly ALERT_THRESHOLD_PENDING: 100;
    readonly ALERT_THRESHOLD_FAILED: 10;
    readonly ALERT_INTERVAL_MS: 300000;
};
export declare const ERROR_PATTERNS: {
    readonly RETRYABLE: {
        readonly CONNECTION_REFUSED: "ECONNREFUSED";
        readonly TIMEOUT: "ETIMEDOUT";
        readonly NOT_FOUND: "ENOTFOUND";
        readonly CONNECTION_LOST: "Connection lost";
    };
    readonly NON_RETRYABLE: {
        readonly DUPLICATE_ENTRY: "Duplicate entry";
        readonly UNIQUE_CONSTRAINT: "unique constraint";
        readonly VALIDATION_FAILED: "Validation failed";
        readonly INVALID_DATA: "Invalid data";
    };
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CDC_EVENT_STRUCTURE: "Invalid CDC event structure";
    readonly UNKNOWN_SOURCE_TABLE: "Unknown source table: {table}";
    readonly UNKNOWN_CDC_OPERATION: "Unknown CDC operation: {op}";
};
