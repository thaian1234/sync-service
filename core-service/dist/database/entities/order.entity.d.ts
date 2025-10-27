export declare enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: number;
    customerId: number;
    total: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
