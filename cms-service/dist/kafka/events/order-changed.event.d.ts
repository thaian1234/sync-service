import { BaseDomainEvent } from './base-domain.event';
import { OrderDto } from '../dto/domain-event.dto';
export declare class OrderChangedEvent extends BaseDomainEvent<OrderDto> {
    constructor(partial: Partial<OrderChangedEvent>);
    static generateEventId(orderId: number, operation: string, timestamp: number): string;
    getOrderId(): number;
}
