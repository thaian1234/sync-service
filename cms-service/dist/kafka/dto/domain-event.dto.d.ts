export declare class ProductDto {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class OrderDto {
    id: number;
    customerId: number;
    total: number;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class CustomerDto {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type EntityDto = ProductDto | OrderDto | CustomerDto;
export declare class DlqEventInputDto {
    eventId?: string;
    tableName: string;
    operation: string;
    payload: any;
    errorMessage: string;
    maxRetries?: number;
}
export declare class DebeziumCdcEventDto {
    __op: "c" | "u" | "d" | "r";
    __source_ts_ms: number;
    __source_table: string;
    [key: string]: any;
}
export declare class EventMetadataDto {
    snapshot?: boolean;
    [key: string]: any;
}
export declare class BaseDomainEventDto<T> {
    eventId: string;
    type: string;
    source: string;
    timestamp: number;
    data: T;
    metadata?: EventMetadataDto;
}
