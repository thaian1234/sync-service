import { BaseDomainEvent } from './base-domain.event';
import { CustomerDto } from '../dto/domain-event.dto';

export class CustomerChangedEvent extends BaseDomainEvent<CustomerDto> {
  constructor(partial: Partial<CustomerChangedEvent>) {
    super(partial);
  }

  /**
   * Generate a unique event ID for idempotency
   */
  static generateEventId(customerId: number, operation: string, timestamp: number): string {
    return `customer-${customerId}-${operation}-${timestamp}`;
  }

  /**
   * Get the customer ID from the event
   */
  getCustomerId(): number {
    return this.data.id;
  }
}
