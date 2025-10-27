import { BaseDomainEvent } from './base-domain.event';
import { OrderDto } from '../dto/domain-event.dto';

export class OrderChangedEvent extends BaseDomainEvent<OrderDto> {
  constructor(partial: Partial<OrderChangedEvent>) {
    super(partial);
  }

  /**
   * Generate a unique event ID for idempotency
   */
  static generateEventId(orderId: number, operation: string, timestamp: number): string {
    return `order-${orderId}-${operation}-${timestamp}`;
  }

  /**
   * Get the order ID from the event
   */
  getOrderId(): number {
    return this.data.id;
  }
}
